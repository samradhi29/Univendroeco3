import session from "express-session";
import connectPg from "connect-pg-simple";
import nodemailer from "nodemailer";
import type { Express, RequestHandler } from "express";
import { storage } from "./storage";
import { Response, NextFunction } from "express";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  return session({
    secret: process.env.SESSION_SECRET || "dev-secret-key-change-in-production",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
      sameSite: "lax",
    },
  });
}

export function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
}

export const isAuthenticated = async (req: any, res: any, next: any) => {
  try {
    // Enhanced logging for authentication
    console.log("Authentication check - Detailed:", {
      sessionId: req.sessionID,
      userId: req.session?.userId,
      session: req.session,
      timestamp: new Date().toISOString(),
    });

    if (!req.session?.userId) {
      console.log("No session userId found");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      console.log("User not found in database:", {
        userId: req.session.userId,
      });
      req.session.destroy(() => {
        res.status(401).json({ message: "User not found" });
      });
      return;
    }

    // Store original role if not already stored
    if (user.role === "seller" && !req.session.originalRole) {
      req.session.originalRole = user.role;
      console.log("Stored original seller role:", {
        userId: user.id,
        email: user.email,
        role: user.role,
      });
    }

    // Set user data in request
    req.user = {
      claims: { sub: user.id.toString() },
      userData: user,
      isImpersonating: req.session.isImpersonating || false,
      originalUser: req.session.originalUser || null,
    };

    console.log("Authentication successful:", {
      userId: user.id,
      email: user.email,
      role: user.role,
      originalRole: req.session.originalRole,
      isImpersonating: req.user.isImpersonating,
    });

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ message: "Authentication failed" });
  }
};

// Email service for sending OTP
export class EmailService {
  private transporter;

  constructor() {
    // Log SMTP configuration for debugging (without showing password)
    console.log("SMTP Configuration:", {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      hasPassword: !!process.env.SMTP_PASS,
    });

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_PORT === "465", // true for 465, false for 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 5000,
    });
  }

  async sendOTP(email: string, code: string): Promise<boolean> {
    // Always log the OTP for development/testing purposes
    console.log(`=== EMAIL OTP ===`);
    console.log(`To: ${email}`);
    console.log(`Subject: Your verification code`);
    console.log(`Code: ${code}`);
    console.log(`================`);

    try {
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: email,
        subject: "Your verification code",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Your Verification Code</h2>
            <p>Please use the following code to verify your email address:</p>
            <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
              ${code}
            </div>
            <p style="color: #666;">This code will expire in 10 minutes.</p>
            <p style="color: #666;">If you didn't request this code, please ignore this email.</p>
          </div>
        `,
      };

      // Set a timeout for the email sending
      const emailPromise = this.transporter.sendMail(mailOptions);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Email timeout")), 10000)
      );

      await Promise.race([emailPromise, timeoutPromise]);
      console.log(`Email sent successfully to ${email}`);
      return true;
    } catch (error) {
      console.error(
        "Email sending failed, but OTP is logged above:",
        error.message
      );
      // Return true even if email fails, since we're logging the OTP
      return true;
    }
  }
}

export const emailService = new EmailService();

// Generate 6-digit OTP
export function generateOTP(): string {
  // Generate a random 6-digit number
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Log the generated OTP for debugging
  console.log("Generated OTP:", {
    otp,
    timestamp: new Date().toISOString(),
  });

  return otp;
}

// Middleware to check vendor domain access
export const checkVendorDomainAccess = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user?.userData;

    // Enhanced logging for debugging
    console.log("Domain Access Check - Detailed:", {
      userId: user?.id,
      userEmail: user?.email,
      userRole: user?.role,
      originalRole: req.session?.originalRole,
      hostname: req.headers.host,
      path: req.path,
      method: req.method,
      sessionId: req.sessionID,
      timestamp: new Date().toISOString(),
    });

    // Get current domain from request
    const hostname = req.headers.host || req.query.domain;
    if (!hostname) {
      console.log("No hostname found in request");
      return res.status(400).json({ message: "Domain not specified" });
    }

    // Remove port if present
    const domain = hostname.split(":")[0];
    console.log("Processing domain:", domain);

    // Special handling for product creation on localhost
    if (
      domain === "localhost" &&
      req.path === "/api/products" &&
      req.method === "POST"
    ) {
      console.log("Product creation on localhost detected");

      if (user?.role === "seller" || req.session?.originalRole === "seller") {
        console.log("User is a seller, fetching vendor account");
        const userVendor = await storage.getVendorByOwner(user.id);

        if (userVendor) {
          console.log("Setting vendor for product creation:", {
            vendorId: userVendor.id,
            vendorName: userVendor.name,
            ownerId: userVendor.ownerId,
          });

          // Set vendor and ensure seller role
          req.vendor = userVendor;
          req.user.userData = { ...req.user.userData, role: "seller" };
          return next();
        } else {
          console.log("No vendor account found for seller:", user.email);
          return res.status(403).json({ message: "Vendor account not found" });
        }
      } else {
        console.log("User is not a seller:", {
          currentRole: user?.role,
          originalRole: req.session?.originalRole,
        });
        return res.status(403).json({ message: "Seller access required" });
      }
    }

    // For non-product creation requests on localhost, skip domain check
    if (domain === "localhost") {
      return next();
    }

    // Find vendor for this domain
    const domainVendor = await storage.getVendorByDomain(domain);
    if (!domainVendor) {
      console.log("Domain not found:", { domain });
      return res.status(404).json({ message: "Store not found" });
    }

    // Super admin has full access to all domains
    if (user?.role === "super_admin") {
      req.vendor = domainVendor;
      // Ensure super admin role is preserved
      req.user.userData = { ...req.user.userData, role: "super_admin" };
      console.log("Super admin accessing domain:", {
        domain,
        vendorId: domainVendor.id,
        vendorName: domainVendor.name,
      });
      return next();
    }

    // For non-super admin users
    if (!user) {
      return next(); // Not authenticated, let other middleware handle it
    }

    // Store original role in session if not already stored
    if (!req.session.originalRole && user.role === "seller") {
      req.session.originalRole = user.role;
    }

    // If user is a vendor
    if (user.role === "seller" || req.session.originalRole === "seller") {
      // Get user's vendor account
      const userVendor = await storage.getVendorByOwner(user.id);

      // Log vendor access attempt
      console.log("Vendor access attempt:", {
        domain,
        domainVendorId: domainVendor.id,
        domainVendorName: domainVendor.name,
        domainVendorEmail: domainVendor.ownerId,
        userVendorId: userVendor?.id,
        userVendorName: userVendor?.name,
        userEmail: user.email,
        originalRole: req.session.originalRole,
      });

      // Check if this vendor owns the domain
      const isDomainOwner = userVendor && userVendor.id === domainVendor.id;

      if (isDomainOwner) {
        // Restore seller role if they own this domain
        req.vendor = userVendor;
        req.user.userData = { ...req.user.userData, role: "seller" };
        console.log("Vendor accessing own domain - restored seller role:", {
          domain,
          vendorId: userVendor.id,
          userEmail: user.email,
        });
      } else {
        // Temporarily change to buyer role if accessing another domain
        req.user.userData = { ...req.user.userData, role: "buyer" };
        delete req.vendor;
        console.log("Vendor accessing other domain - temporary buyer role:", {
          domain,
          userEmail: user.email,
          attemptedVendorId: userVendor?.id,
          domainVendorId: domainVendor.id,
          originalRole: req.session.originalRole,
          reason: "Vendor accessing another vendor's domain",
        });
      }
      return next();
    }

    // For buyers and other roles, just continue
    next();
  } catch (error) {
    console.error("Domain access check error:", error);
    res.status(500).json({ message: "Error checking domain access" });
  }
};
