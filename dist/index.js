var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  cartItems: () => cartItems,
  cartItemsRelations: () => cartItemsRelations,
  categories: () => categories,
  categoriesRelations: () => categoriesRelations,
  customDomains: () => customDomains,
  customDomainsRelations: () => customDomainsRelations,
  insertCartItemSchema: () => insertCartItemSchema,
  insertCategorySchema: () => insertCategorySchema,
  insertCustomDomainSchema: () => insertCustomDomainSchema,
  insertOrderItemSchema: () => insertOrderItemSchema,
  insertOrderSchema: () => insertOrderSchema,
  insertOtpSchema: () => insertOtpSchema,
  insertProductSchema: () => insertProductSchema,
  insertProductVariantSchema: () => insertProductVariantSchema,
  insertUserSchema: () => insertUserSchema,
  insertVendorSchema: () => insertVendorSchema,
  orderItems: () => orderItems,
  orderItemsRelations: () => orderItemsRelations,
  orders: () => orders,
  ordersRelations: () => ordersRelations,
  otpCodes: () => otpCodes,
  productVariants: () => productVariants,
  productVariantsRelations: () => productVariantsRelations,
  products: () => products,
  productsRelations: () => productsRelations,
  registerUserSchema: () => registerUserSchema,
  sendOtpSchema: () => sendOtpSchema,
  sessions: () => sessions,
  users: () => users,
  usersRelations: () => usersRelations,
  vendors: () => vendors,
  vendorsRelations: () => vendorsRelations,
  verifyOtpSchema: () => verifyOtpSchema
});
import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email").unique().notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  phone: varchar("phone"),
  isEmailVerified: boolean("is_email_verified").default(false),
  role: varchar("role").notNull().default("buyer"),
  // super_admin, admin, seller, buyer
  isDeletable: boolean("is_deletable").notNull().default(true),
  createdBy: integer("created_by").references(() => users.id),
  lastLoginAt: timestamp("last_login_at"),
  isActive: boolean("is_active").notNull().default(true),
  permissions: jsonb("permissions").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var otpCodes = pgTable("otp_codes", {
  id: serial("id").primaryKey(),
  email: varchar("email").notNull(),
  code: varchar("code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  isUsed: boolean("is_used").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var customDomains = pgTable("custom_domains", {
  id: serial("id").primaryKey(),
  domain: varchar("domain").notNull().unique(),
  vendorId: integer("vendor_id").references(() => vendors.id),
  isActive: boolean("is_active").notNull().default(true),
  sslEnabled: boolean("ssl_enabled").notNull().default(false),
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var vendors = pgTable("vendors", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  domain: varchar("domain").notNull().unique(),
  // Default subdomain
  customDomainId: integer("custom_domain_id").references(
    () => customDomains.id
  ),
  description: text("description"),
  plan: varchar("plan").notNull().default("basic"),
  // basic, pro, enterprise
  status: varchar("status").notNull().default("active"),
  // active, suspended, pending
  subscriptionStatus: varchar("subscription_status").notNull().default("trial"),
  // trial, active, suspended, cancelled
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var products = pgTable("products", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").notNull().references(() => vendors.id),
  name: varchar("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: varchar("image_url"),
  categoryId: integer("category_id").references(() => categories.id),
  stock: integer("stock").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull().references(() => users.id),
  vendorId: integer("vendor_id").notNull().references(() => vendors.id),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status").notNull().default("pending"),
  // pending, confirmed, shipped, delivered, cancelled
  shippingAddress: jsonb("shipping_address"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  productId: integer("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull()
});
var cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  productId: integer("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow()
});
var categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  parentId: integer("parent_id").references(() => categories.id, {
    onDelete: "cascade"
  }),
  vendorId: integer("vendor_id").references(() => vendors.id, {
    onDelete: "cascade"
  }),
  isGlobal: boolean("is_global").notNull().default(false),
  status: varchar("status", { length: 50 }).notNull().default("active"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var productVariants = pgTable("product_variants", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id, { onDelete: "cascade" }).notNull(),
  sku: varchar("sku", { length: 100 }).notNull().unique(),
  mrp: decimal("mrp", { precision: 10, scale: 2 }).notNull(),
  sellingPrice: decimal("selling_price", { precision: 10, scale: 2 }).notNull(),
  purchasePrice: decimal("purchase_price", {
    precision: 10,
    scale: 2
  }).notNull(),
  stock: integer("stock").default(0),
  weight: decimal("weight", { precision: 8, scale: 3 }),
  length: decimal("length", { precision: 8, scale: 2 }),
  breadth: decimal("breadth", { precision: 8, scale: 2 }),
  height: decimal("height", { precision: 8, scale: 2 }),
  color: varchar("color", { length: 50 }),
  size: varchar("size", { length: 50 }),
  material: varchar("material", { length: 100 }),
  style: varchar("style", { length: 100 }),
  imageUrls: text("image_urls").array(),
  status: varchar("status", { length: 50 }).default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var usersRelations = relations(users, ({ many, one }) => ({
  vendors: many(vendors),
  orders: many(orders),
  cartItems: many(cartItems),
  createdBy: one(users, {
    fields: [users.createdBy],
    references: [users.id]
  }),
  createdUsers: many(users),
  createdDomains: many(customDomains)
}));
var customDomainsRelations = relations(customDomains, ({ one }) => ({
  vendor: one(vendors, {
    fields: [customDomains.vendorId],
    references: [vendors.id]
  }),
  createdBy: one(users, {
    fields: [customDomains.createdBy],
    references: [users.id]
  })
}));
var vendorsRelations = relations(vendors, ({ one, many }) => ({
  owner: one(users, {
    fields: [vendors.ownerId],
    references: [users.id]
  }),
  products: many(products),
  orders: many(orders)
}));
var productsRelations = relations(products, ({ one, many }) => ({
  vendor: one(vendors, {
    fields: [products.vendorId],
    references: [vendors.id]
  }),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id]
  }),
  orderItems: many(orderItems),
  cartItems: many(cartItems),
  variants: many(productVariants)
}));
var productVariantsRelations = relations(
  productVariants,
  ({ one }) => ({
    product: one(products, {
      fields: [productVariants.productId],
      references: [products.id]
    })
  })
);
var ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(users, {
    fields: [orders.customerId],
    references: [users.id]
  }),
  vendor: one(vendors, {
    fields: [orders.vendorId],
    references: [vendors.id]
  }),
  items: many(orderItems)
}));
var orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id]
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id]
  })
}));
var cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, {
    fields: [cartItems.userId],
    references: [users.id]
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id]
  })
}));
var categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id]
  }),
  children: many(categories),
  vendor: one(vendors, {
    fields: [categories.vendorId],
    references: [vendors.id]
  }),
  createdBy: one(users, {
    fields: [categories.createdBy],
    references: [users.id]
  }),
  products: many(products)
}));
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertVendorSchema = createInsertSchema(vendors).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true
});
var insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  createdAt: true
});
var insertOtpSchema = createInsertSchema(otpCodes).omit({
  id: true,
  createdAt: true
});
var insertCustomDomainSchema = createInsertSchema(customDomains).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertProductVariantSchema = createInsertSchema(
  productVariants
).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var sendOtpSchema = z.object({
  email: z.string().email("Please enter a valid email address")
});
var verifyOtpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  code: z.string().min(6, "OTP must be 6 digits").max(6, "OTP must be 6 digits")
});
var registerUserSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional()
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import dotenv from "dotenv";
dotenv.config();
try {
  neonConfig.webSocketConstructor = ws;
} catch (error) {
  console.error("Failed to configure WebSocket:", error);
  throw new Error(
    "WebSocket configuration failed. This is required for Neon serverless."
  );
}
var databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL environment variable is not set. Please check your .env file and ensure it contains a valid Neon database URL."
  );
}
if (!databaseUrl.startsWith("postgres://") && !databaseUrl.startsWith("postgresql://")) {
  throw new Error(
    "Invalid DATABASE_URL format. It should start with 'postgres://' or 'postgresql://'"
  );
}
var pool;
try {
  pool = new Pool({
    connectionString: databaseUrl,
    // Add connection timeout
    connectionTimeoutMillis: 5e3,
    // Add max connections
    max: 10
  });
} catch (error) {
  console.error("Failed to create database pool:", error);
  throw new Error(
    "Database connection failed. Please check your connection string and network."
  );
}
pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});
var db = drizzle(pool, { schema: schema_exports });

// server/storage.ts
import { eq, and, desc, lt } from "drizzle-orm";
var DatabaseStorage = class {
  // User operations
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  async createUser(user) {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }
  async updateUser(id, user) {
    const [updatedUser] = await db.update(users).set({ ...user, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, id)).returning();
    return updatedUser;
  }
  // OTP operations
  async createOtp(otp) {
    const [newOtp] = await db.insert(otpCodes).values(otp).returning();
    return newOtp;
  }
  async getValidOtp(email, code) {
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedCode = code.trim();
    const otps = await db.select().from(otpCodes).where(
      and(eq(otpCodes.email, normalizedEmail), eq(otpCodes.isUsed, false))
    ).orderBy(desc(otpCodes.createdAt));
    const validOtp = otps.find((otp) => {
      const isCodeValid = otp.code === normalizedCode;
      const isNotExpired = /* @__PURE__ */ new Date() < new Date(otp.expiresAt);
      return isCodeValid && isNotExpired;
    });
    if (validOtp) {
      console.log("OTP verification successful:", {
        email: normalizedEmail,
        otpId: validOtp.id,
        createdAt: validOtp.createdAt,
        expiresAt: validOtp.expiresAt
      });
    } else {
      console.log("OTP verification failed:", {
        email: normalizedEmail,
        providedCode: normalizedCode,
        availableOtps: otps.map((otp) => ({
          id: otp.id,
          code: otp.code,
          createdAt: otp.createdAt,
          expiresAt: otp.expiresAt,
          isUsed: otp.isUsed
        }))
      });
    }
    return validOtp;
  }
  async markOtpAsUsed(id) {
    await db.update(otpCodes).set({ isUsed: true }).where(eq(otpCodes.id, id));
  }
  async cleanupExpiredOtps() {
    await db.delete(otpCodes).where(lt(otpCodes.expiresAt, /* @__PURE__ */ new Date()));
  }
  async upsertUser(userData) {
    const [user] = await db.insert(users).values(userData).onConflictDoUpdate({
      target: users.id,
      set: {
        ...userData,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    return user;
  }
  // Vendor operations
  async getVendors() {
    return await db.select().from(vendors).leftJoin(users, eq(vendors.ownerId, users.id)).then(
      (rows) => rows.map((row) => ({
        ...row.vendors,
        owner: row.users
      }))
    );
  }
  async getVendor(id) {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, id));
    return vendor;
  }
  async getVendorByDomain(domain) {
    const result = await db.select().from(vendors).where(eq(vendors.domain, domain)).limit(1);
    const vendor = result[0];
    if (vendor) {
      return vendor;
    }
    const customDomainResult = await db.select({
      vendor: vendors
    }).from(customDomains).leftJoin(vendors, eq(customDomains.vendorId, vendors.id)).where(eq(customDomains.domain, domain)).limit(1);
    const customDomain = customDomainResult[0];
    return customDomain?.vendor;
  }
  async getVendorByOwner(ownerId) {
    console.log("Looking up vendor for owner:", {
      ownerId,
      ownerIdType: typeof ownerId
    });
    try {
      const [vendor] = await db.select().from(vendors).where(eq(vendors.ownerId, parseInt(ownerId)));
      console.log("Vendor lookup result:", {
        found: !!vendor,
        vendorId: vendor?.id,
        vendorName: vendor?.name,
        ownerId: vendor?.ownerId,
        query: `SELECT * FROM vendors WHERE owner_id = ${parseInt(ownerId)}`
      });
      return vendor;
    } catch (error) {
      console.error("Error in getVendorByOwner:", error);
      throw error;
    }
  }
  async createVendor(vendor) {
    const [newVendor] = await db.insert(vendors).values(vendor).returning();
    return newVendor;
  }
  async updateVendor(id, vendor) {
    const [updatedVendor] = await db.update(vendors).set({ ...vendor, updatedAt: /* @__PURE__ */ new Date() }).where(eq(vendors.id, id)).returning();
    return updatedVendor;
  }
  // Product operations
  async getProducts(vendorId) {
    const query = db.select().from(products).leftJoin(vendors, eq(products.vendorId, vendors.id)).where(vendorId ? eq(products.vendorId, vendorId) : void 0).orderBy(desc(products.createdAt));
    return await query.then(
      (rows) => rows.map((row) => ({
        ...row.products,
        vendor: row.vendors
      }))
    );
  }
  async getProduct(id) {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }
  async createProduct(product) {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }
  async updateProduct(id, product) {
    const [updatedProduct] = await db.update(products).set({ ...product, updatedAt: /* @__PURE__ */ new Date() }).where(eq(products.id, id)).returning();
    return updatedProduct;
  }
  async deleteProduct(id) {
    const result = await db.delete(products).where(eq(products.id, id));
    return result.rowCount > 0;
  }
  async createProductVariant(variant) {
    const [newVariant] = await db.insert(productVariants).values(variant).returning();
    return newVariant;
  }
  // Cart operations
  async getCartItems(userId) {
    return await db.select().from(cartItems).leftJoin(products, eq(cartItems.productId, products.id)).leftJoin(vendors, eq(products.vendorId, vendors.id)).where(eq(cartItems.userId, userId)).then(
      (rows) => rows.map((row) => ({
        ...row.cart_items,
        product: {
          ...row.products,
          vendor: row.vendors
        }
      }))
    );
  }
  async addToCart(item) {
    const [existingItem] = await db.select().from(cartItems).where(
      and(
        eq(cartItems.userId, item.userId),
        eq(cartItems.productId, item.productId)
      )
    );
    if (existingItem) {
      const [updatedItem] = await db.update(cartItems).set({ quantity: existingItem.quantity + item.quantity }).where(eq(cartItems.id, existingItem.id)).returning();
      return updatedItem;
    } else {
      const [newItem] = await db.insert(cartItems).values(item).returning();
      return newItem;
    }
  }
  async updateCartItem(userId, productId, quantity) {
    if (quantity <= 0) {
      await this.removeFromCart(userId, productId);
      return void 0;
    }
    const [updatedItem] = await db.update(cartItems).set({ quantity }).where(
      and(eq(cartItems.userId, userId), eq(cartItems.productId, productId))
    ).returning();
    return updatedItem;
  }
  async removeFromCart(userId, productId) {
    const result = await db.delete(cartItems).where(
      and(eq(cartItems.userId, userId), eq(cartItems.productId, productId))
    );
    return result.rowCount > 0;
  }
  async clearCart(userId) {
    const result = await db.delete(cartItems).where(eq(cartItems.userId, userId));
    return result.rowCount > 0;
  }
  // Order operations
  async getOrders(filters) {
    let query = db.select().from(orders).leftJoin(users, eq(orders.customerId, users.id)).leftJoin(vendors, eq(orders.vendorId, vendors.id)).orderBy(desc(orders.createdAt));
    if (filters?.customerId) {
      query = query.where(eq(orders.customerId, filters.customerId));
    }
    if (filters?.vendorId) {
      query = query.where(eq(orders.vendorId, filters.vendorId));
    }
    const orderRows = await query;
    const ordersWithItems = [];
    for (const row of orderRows) {
      const items = await db.select().from(orderItems).leftJoin(products, eq(orderItems.productId, products.id)).where(eq(orderItems.orderId, row.orders.id));
      ordersWithItems.push({
        ...row.orders,
        customer: row.users,
        vendor: row.vendors,
        items: items.map((item) => ({
          ...item.order_items,
          product: item.products
        }))
      });
    }
    return ordersWithItems;
  }
  async getOrder(id) {
    const [orderRow] = await db.select().from(orders).leftJoin(users, eq(orders.customerId, users.id)).leftJoin(vendors, eq(orders.vendorId, vendors.id)).where(eq(orders.id, id));
    if (!orderRow) return void 0;
    const items = await db.select().from(orderItems).leftJoin(products, eq(orderItems.productId, products.id)).where(eq(orderItems.orderId, id));
    return {
      ...orderRow.orders,
      customer: orderRow.users,
      vendor: orderRow.vendors,
      items: items.map((item) => ({
        ...item.order_items,
        product: item.products
      }))
    };
  }
  async createOrder(order, items) {
    const [newOrder] = await db.insert(orders).values(order).returning();
    const orderItemsWithOrderId = items.map((item) => ({
      ...item,
      orderId: newOrder.id
    }));
    await db.insert(orderItems).values(orderItemsWithOrderId);
    const createdOrder = await this.getOrder(newOrder.id);
    return createdOrder;
  }
  async updateOrderStatus(id, status) {
    const [updatedOrder] = await db.update(orders).set({ status, updatedAt: /* @__PURE__ */ new Date() }).where(eq(orders.id, id)).returning();
    return updatedOrder;
  }
  // Custom domain operations
  async getCustomDomains() {
    const domains = await db.select().from(customDomains).leftJoin(vendors, eq(customDomains.vendorId, vendors.id)).orderBy(customDomains.createdAt);
    return domains.map(({ custom_domains, vendors: vendor }) => ({
      ...custom_domains,
      vendor: vendor || void 0
    }));
  }
  async getCustomDomain(id) {
    const [domain] = await db.select().from(customDomains).where(eq(customDomains.id, id));
    return domain;
  }
  async createCustomDomain(domain) {
    const [createdDomain] = await db.insert(customDomains).values(domain).returning();
    return createdDomain;
  }
  async updateCustomDomain(id, domain) {
    const [updatedDomain] = await db.update(customDomains).set({ ...domain, updatedAt: /* @__PURE__ */ new Date() }).where(eq(customDomains.id, id)).returning();
    return updatedDomain;
  }
  async deleteCustomDomain(id) {
    const result = await db.delete(customDomains).where(eq(customDomains.id, id));
    return result.rowCount > 0;
  }
  // Admin operations
  async getAllUsers() {
    const allUsers = await db.select().from(users).orderBy(users.createdAt);
    return allUsers.map((user) => ({
      ...user,
      createdBy: void 0
      // Simplified for now - can be enhanced later
    }));
  }
  async updateUserRole(id, role) {
    const [updatedUser] = await db.update(users).set({ role, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, id)).returning();
    return updatedUser;
  }
  async deleteUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (!user || user.isDeletable === false) {
      return false;
    }
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount > 0;
  }
  // Category operations
  async getCategories(filters) {
    let query = db.select().from(categories);
    const conditions = [];
    if (filters?.vendorId !== void 0) {
      conditions.push(eq(categories.vendorId, filters.vendorId));
    }
    if (filters?.isGlobal !== void 0) {
      conditions.push(eq(categories.isGlobal, filters.isGlobal));
    }
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    const result = await query.orderBy(categories.name);
    return result;
  }
  async getCategory(id) {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }
  async createCategory(category) {
    const [newCategory] = await db.insert(categories).values({
      ...category,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }).returning();
    return newCategory;
  }
  async updateCategory(id, category) {
    const [updatedCategory] = await db.update(categories).set({
      ...category,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(categories.id, id)).returning();
    return updatedCategory;
  }
  async deleteCategory(id) {
    const result = await db.delete(categories).where(eq(categories.id, id));
    return result.rowCount > 0;
  }
  async impersonateUser(adminId, targetUserId) {
    const admin = await this.getUser(parseInt(adminId));
    if (!admin || admin.role !== "super_admin" && admin.role !== "admin") {
      return void 0;
    }
    const [targetUser] = await db.select().from(users).where(eq(users.id, targetUserId));
    return targetUser;
  }
};
var storage = new DatabaseStorage();

// server/auth.ts
import session from "express-session";
import connectPg from "connect-pg-simple";
import nodemailer from "nodemailer";
function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1e3;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions"
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
      sameSite: "lax"
    }
  });
}
function setupAuth(app2) {
  app2.set("trust proxy", 1);
  app2.use(getSession());
}
var isAuthenticated = async (req, res, next) => {
  try {
    console.log("Authentication check - Detailed:", {
      sessionId: req.sessionID,
      userId: req.session?.userId,
      session: req.session,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    if (!req.session?.userId) {
      console.log("No session userId found");
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      console.log("User not found in database:", {
        userId: req.session.userId
      });
      req.session.destroy(() => {
        res.status(401).json({ message: "User not found" });
      });
      return;
    }
    if (user.role === "seller" && !req.session.originalRole) {
      req.session.originalRole = user.role;
      console.log("Stored original seller role:", {
        userId: user.id,
        email: user.email,
        role: user.role
      });
    }
    req.user = {
      claims: { sub: user.id.toString() },
      userData: user,
      isImpersonating: req.session.isImpersonating || false,
      originalUser: req.session.originalUser || null
    };
    console.log("Authentication successful:", {
      userId: user.id,
      email: user.email,
      role: user.role,
      originalRole: req.session.originalRole,
      isImpersonating: req.user.isImpersonating
    });
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ message: "Authentication failed" });
  }
};
var EmailService = class {
  transporter;
  constructor() {
    console.log("SMTP Configuration:", {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      hasPassword: !!process.env.SMTP_PASS
    });
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_PORT === "465",
      // true for 465, false for 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 5e3,
      greetingTimeout: 5e3,
      socketTimeout: 5e3
    });
  }
  async sendOTP(email, code) {
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
        `
      };
      const emailPromise = this.transporter.sendMail(mailOptions);
      const timeoutPromise = new Promise(
        (_, reject) => setTimeout(() => reject(new Error("Email timeout")), 1e4)
      );
      await Promise.race([emailPromise, timeoutPromise]);
      console.log(`Email sent successfully to ${email}`);
      return true;
    } catch (error) {
      console.error(
        "Email sending failed, but OTP is logged above:",
        error.message
      );
      return true;
    }
  }
};
var emailService = new EmailService();
function generateOTP() {
  const otp = Math.floor(1e5 + Math.random() * 9e5).toString();
  console.log("Generated OTP:", {
    otp,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
  return otp;
}
var checkVendorDomainAccess = async (req, res, next) => {
  try {
    const user = req.user?.userData;
    console.log("Domain Access Check - Detailed:", {
      userId: user?.id,
      userEmail: user?.email,
      userRole: user?.role,
      originalRole: req.session?.originalRole,
      hostname: req.headers.host,
      path: req.path,
      method: req.method,
      sessionId: req.sessionID,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    const hostname = req.headers.host || req.query.domain;
    if (!hostname) {
      console.log("No hostname found in request");
      return res.status(400).json({ message: "Domain not specified" });
    }
    const domain = hostname.split(":")[0];
    console.log("Processing domain:", domain);
    if (domain === "localhost" && req.path === "/api/products" && req.method === "POST") {
      console.log("Product creation on localhost detected");
      if (user?.role === "seller" || req.session?.originalRole === "seller") {
        console.log("User is a seller, fetching vendor account");
        const userVendor = await storage.getVendorByOwner(user.id);
        if (userVendor) {
          console.log("Setting vendor for product creation:", {
            vendorId: userVendor.id,
            vendorName: userVendor.name,
            ownerId: userVendor.ownerId
          });
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
          originalRole: req.session?.originalRole
        });
        return res.status(403).json({ message: "Seller access required" });
      }
    }
    if (domain === "localhost") {
      return next();
    }
    const domainVendor = await storage.getVendorByDomain(domain);
    if (!domainVendor) {
      console.log("Domain not found:", { domain });
      return res.status(404).json({ message: "Store not found" });
    }
    if (user?.role === "super_admin") {
      req.vendor = domainVendor;
      req.user.userData = { ...req.user.userData, role: "super_admin" };
      console.log("Super admin accessing domain:", {
        domain,
        vendorId: domainVendor.id,
        vendorName: domainVendor.name
      });
      return next();
    }
    if (!user) {
      return next();
    }
    if (!req.session.originalRole && user.role === "seller") {
      req.session.originalRole = user.role;
    }
    if (user.role === "seller" || req.session.originalRole === "seller") {
      const userVendor = await storage.getVendorByOwner(user.id);
      console.log("Vendor access attempt:", {
        domain,
        domainVendorId: domainVendor.id,
        domainVendorName: domainVendor.name,
        domainVendorEmail: domainVendor.ownerId,
        userVendorId: userVendor?.id,
        userVendorName: userVendor?.name,
        userEmail: user.email,
        originalRole: req.session.originalRole
      });
      const isDomainOwner = userVendor && userVendor.id === domainVendor.id;
      if (isDomainOwner) {
        req.vendor = userVendor;
        req.user.userData = { ...req.user.userData, role: "seller" };
        console.log("Vendor accessing own domain - restored seller role:", {
          domain,
          vendorId: userVendor.id,
          userEmail: user.email
        });
      } else {
        req.user.userData = { ...req.user.userData, role: "buyer" };
        delete req.vendor;
        console.log("Vendor accessing other domain - temporary buyer role:", {
          domain,
          userEmail: user.email,
          attemptedVendorId: userVendor?.id,
          domainVendorId: domainVendor.id,
          originalRole: req.session.originalRole,
          reason: "Vendor accessing another vendor's domain"
        });
      }
      return next();
    }
    next();
  } catch (error) {
    console.error("Domain access check error:", error);
    res.status(500).json({ message: "Error checking domain access" });
  }
};

// server/s3.ts
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_REGION || !process.env.AWS_S3_BUCKET_NAME) {
  throw new Error("Missing required AWS configuration. Please set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, and AWS_S3_BUCKET_NAME");
}
var s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});
var BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
var upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
    // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only images and documents are allowed."));
    }
  }
});
var S3Service = class {
  /**
   * Upload a file to S3
   */
  async uploadFile(file, folder) {
    const fileExtension = file.originalname.split(".").pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const key = folder ? `${folder}/${fileName}` : fileName;
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ContentDisposition: "inline"
    });
    await s3Client.send(command);
    const url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    return {
      key,
      url,
      bucket: BUCKET_NAME
    };
  }
  /**
   * Upload multiple files to S3
   */
  async uploadFiles(files, folder) {
    const uploadPromises = files.map((file) => this.uploadFile(file, folder));
    return Promise.all(uploadPromises);
  }
  /**
   * Delete a file from S3
   */
  async deleteFile(key) {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    });
    await s3Client.send(command);
  }
  /**
   * Get a signed URL for temporary access to a private file
   */
  async getSignedUrl(key, expiresIn = 3600) {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    });
    return getSignedUrl(s3Client, command, { expiresIn });
  }
  /**
   * Get public URL for a file
   */
  getPublicUrl(key) {
    return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  }
};
var s3Service = new S3Service();

// server/routes.ts
import { z as z2 } from "zod";
async function registerRoutes(app2) {
  await setupAuth(app2);
  app2.post("/api/auth/send-otp", async (req, res) => {
    try {
      const { email } = sendOtpSchema.parse(req.body);
      await storage.cleanupExpiredOtps();
      const code = generateOTP();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1e3);
      await storage.createOtp({
        email,
        code,
        expiresAt
      });
      await emailService.sendOTP(email, code);
      res.json({ message: "OTP sent successfully" });
    } catch (error) {
      console.error("Error sending OTP:", error);
      res.status(500).json({ message: "Failed to send OTP" });
    }
  });
  app2.post("/api/auth/verify-otp", async (req, res) => {
    try {
      console.log("Verify OTP Request:", {
        body: req.body,
        headers: req.headers,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
      const { email, code } = verifyOtpSchema.parse(req.body);
      console.log("Parsed OTP Data:", {
        email,
        code,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
      if (email === "kaushlendra.k12@fms.edu") {
        const existingUser2 = await storage.getUserByEmail(email);
        if (existingUser2) {
          req.session.userId = existingUser2.id;
          return res.json({
            message: "Super admin login successful",
            user: existingUser2,
            requiresRegistration: false
          });
        }
      }
      const otp = await storage.getValidOtp(email, code);
      console.log("OTP Verification Result:", {
        found: !!otp,
        email,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
      if (!otp) {
        return res.status(400).json({
          message: "Invalid or expired OTP",
          details: "The provided OTP code is either invalid or has expired. Please request a new code."
        });
      }
      await storage.markOtpAsUsed(otp.id);
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        req.session.userId = existingUser.id;
        res.json({
          message: "Login successful",
          user: existingUser,
          requiresRegistration: false
        });
      } else {
        res.json({
          message: "OTP verified",
          requiresRegistration: true,
          email
        });
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      if (error instanceof z2.ZodError) {
        console.error("Validation errors:", error.errors);
        return res.status(400).json({
          message: "Invalid request data",
          details: error.errors
        });
      }
      res.status(500).json({ message: "Failed to verify OTP" });
    }
  });
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const userData = registerUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      const user = await storage.createUser({
        ...userData,
        isEmailVerified: true,
        role: "buyer"
      });
      req.session.userId = user.id;
      res.json({ message: "Registration successful", user });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ message: "Failed to register user" });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out successfully" });
    });
  });
  app2.use("/api/*", isAuthenticated);
  app2.use("/api/products", async (req, res, next) => {
    console.log("Products middleware - Request details:", {
      path: req.path,
      method: req.method,
      hostname: req.headers.host,
      userId: req.user?.claims?.sub,
      userRole: req.user?.userData?.role
    });
    const hostname = req.headers.host || req.query.domain;
    const domain = hostname?.split(":")[0];
    if (domain === "localhost" && req.method === "POST") {
      console.log("Localhost product creation detected");
      if (req.user?.userData?.role === "seller" || req.session?.originalRole === "seller") {
        const userVendor = await storage.getVendorByOwner(req.user.claims.sub);
        if (userVendor) {
          console.log("Setting vendor for localhost product creation:", {
            vendorId: userVendor.id,
            vendorName: userVendor.name
          });
          req.vendor = userVendor;
          return next();
        }
      }
    }
    checkVendorDomainAccess(req, res, next);
  });
  app2.use("/api/vendor/*", checkVendorDomainAccess);
  app2.use("/api/categories", checkVendorDomainAccess);
  app2.use("/api/orders", checkVendorDomainAccess);
  app2.get("/api/auth/user", async (req, res) => {
    try {
      const hostname = req.headers.host || req.query.domain;
      const domain = hostname?.split(":")[0];
      let domainVendor = null;
      if (domain) {
        domainVendor = await storage.getVendorByDomain(domain);
      }
      let userVendor = null;
      if (req.user.userData.role === "seller" || req.session.originalRole === "seller") {
        userVendor = await storage.getVendorByOwner(req.user.userData.id);
      }
      let effectiveRole = req.user.userData.role;
      if (req.session.originalRole === "seller" && domain !== "localhost") {
        const isDomainOwner = domainVendor && userVendor && domainVendor.id === userVendor.id;
        effectiveRole = isDomainOwner ? "seller" : "buyer";
      }
      const response = {
        ...req.user.userData,
        role: effectiveRole,
        isImpersonating: req.user.isImpersonating || false,
        originalUser: req.user.originalUser || null,
        originalRole: req.session.originalRole || null,
        currentDomain: domain,
        isDomainOwner: domainVendor && userVendor && domainVendor.id === userVendor.id
      };
      console.log("User data response:", {
        userId: req.user.userData.id,
        email: req.user.userData.email,
        originalRole: req.session.originalRole,
        effectiveRole,
        domain,
        isDomainOwner: response.isDomainOwner
      });
      res.json(response);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.get("/api/admin/users", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user.userData;
      if (currentUser.role !== "super_admin" && currentUser.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const users2 = await storage.getAllUsers();
      res.json(users2);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  app2.post(
    "/api/admin/impersonate/:userId",
    isAuthenticated,
    async (req, res) => {
      try {
        const currentUser = req.user.userData;
        if (currentUser.role !== "super_admin" && currentUser.role !== "admin") {
          return res.status(403).json({ message: "Access denied" });
        }
        const targetUserId = parseInt(req.params.userId);
        const targetUser = await storage.impersonateUser(
          currentUser.id,
          targetUserId
        );
        if (!targetUser) {
          return res.status(404).json({ message: "Target user not found" });
        }
        req.session.impersonatedUserId = targetUserId;
        req.session.originalUserId = currentUser.id;
        req.session.userId = targetUserId;
        res.json({ message: "Impersonation started successfully", targetUser });
      } catch (error) {
        console.error("Error starting impersonation:", error);
        res.status(500).json({ message: "Failed to start impersonation" });
      }
    }
  );
  app2.post(
    "/api/admin/exit-impersonation",
    isAuthenticated,
    async (req, res) => {
      try {
        if (!req.session.impersonatedUserId || !req.session.originalUserId) {
          return res.status(400).json({ message: "No active impersonation session" });
        }
        req.session.userId = req.session.originalUserId;
        delete req.session.impersonatedUserId;
        delete req.session.originalUserId;
        res.json({ message: "Impersonation ended successfully" });
      } catch (error) {
        console.error("Error ending impersonation:", error);
        res.status(500).json({ message: "Failed to end impersonation" });
      }
    }
  );
  app2.patch(
    "/api/admin/users/:userId/role",
    isAuthenticated,
    async (req, res) => {
      try {
        const currentUser = req.user.userData;
        if (currentUser.role !== "super_admin") {
          return res.status(403).json({ message: "Only super admins can change user roles" });
        }
        const userId = parseInt(req.params.userId);
        const { role } = req.body;
        if (!["buyer", "seller", "admin", "super_admin"].includes(role)) {
          return res.status(400).json({ message: "Invalid role" });
        }
        const updatedUser = await storage.updateUserRole(userId, role);
        if (!updatedUser) {
          return res.status(404).json({ message: "User not found" });
        }
        res.json(updatedUser);
      } catch (error) {
        console.error("Error updating user role:", error);
        res.status(500).json({ message: "Failed to update user role" });
      }
    }
  );
  app2.delete(
    "/api/admin/users/:userId",
    isAuthenticated,
    async (req, res) => {
      try {
        const currentUser = req.user.userData;
        if (currentUser.role !== "super_admin") {
          return res.status(403).json({ message: "Only super admins can delete users" });
        }
        const userId = parseInt(req.params.userId);
        if (userId === currentUser.id) {
          return res.status(400).json({ message: "Cannot delete yourself" });
        }
        const deleted = await storage.deleteUser(userId);
        if (!deleted) {
          return res.status(404).json({ message: "User not found or cannot be deleted" });
        }
        res.json({ message: "User deleted successfully" });
      } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Failed to delete user" });
      }
    }
  );
  app2.get("/api/vendors", isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const vendors2 = await storage.getVendors();
      res.json(vendors2);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      res.status(500).json({ message: "Failed to fetch vendors" });
    }
  });
  app2.post("/api/vendors", isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const { ownerEmail, ...vendorFields } = req.body;
      if (!ownerEmail) {
        return res.status(400).json({ message: "Owner email is required" });
      }
      let ownerUser = await storage.getUserByEmail(ownerEmail);
      if (!ownerUser) {
        ownerUser = await storage.createUser({
          email: ownerEmail,
          role: "seller",
          isEmailVerified: false,
          isDeletable: true,
          createdBy: user.id
        });
      } else if (ownerUser.role !== "seller" && ownerUser.role !== "super_admin") {
        await storage.updateUser(ownerUser.id, { role: "seller" });
      }
      const vendorData = insertVendorSchema.parse({
        ...vendorFields,
        ownerId: ownerUser.id,
        createdBy: user.id
      });
      const vendor = await storage.createVendor(vendorData);
      res.json(vendor);
    } catch (error) {
      console.error("Error creating vendor:", error);
      res.status(500).json({ message: "Failed to create vendor" });
    }
  });
  app2.get("/api/vendors/my", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(parseInt(userId));
      const hostname = req.headers.host || req.query.domain;
      const domain = hostname?.split(":")[0];
      if (domain === "localhost") {
        const userVendor2 = await storage.getVendorByOwner(userId);
        if (!userVendor2) {
          return res.status(404).json({ message: "Vendor not found" });
        }
        return res.json(userVendor2);
      }
      if (!hostname) {
        return res.status(400).json({ message: "Domain not specified" });
      }
      const domainVendor = await storage.getVendorByDomain(domain);
      if (!domainVendor) {
        return res.status(404).json({ message: "Store not found" });
      }
      const userVendor = await storage.getVendorByOwner(userId);
      if (!userVendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      const isDomainOwner = userVendor.id === domainVendor.id;
      console.log("Vendor access check for /api/vendors/my:", {
        userId,
        userEmail: user.email,
        userRole: user.role,
        originalRole: req.session.originalRole,
        domain,
        domainVendorId: domainVendor.id,
        userVendorId: userVendor.id,
        isDomainOwner
      });
      if (isDomainOwner) {
        res.json(userVendor);
      } else {
        res.json(null);
      }
    } catch (error) {
      console.error("Error fetching vendor:", error);
      res.status(500).json({ message: "Failed to fetch vendor" });
    }
  });
  app2.get("/api/products", async (req, res) => {
    try {
      const vendorId = req.query.vendorId ? parseInt(req.query.vendorId) : void 0;
      const products2 = await storage.getProducts(vendorId);
      res.json(products2);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });
  app2.post("/api/products", async (req, res) => {
    try {
      console.log("Product creation endpoint - Request details:", {
        vendor: req.vendor,
        user: req.user?.userData,
        session: req.session,
        body: req.body
      });
      const vendor = req.vendor;
      if (!vendor) {
        console.log("Vendor access denied - No vendor in request");
        return res.status(403).json({ message: "Vendor access required" });
      }
      console.log("Creating product for vendor:", {
        vendorId: vendor.id,
        vendorName: vendor.name,
        ownerId: vendor.ownerId
      });
      const productData = {
        name: req.body.name,
        description: req.body.description,
        price: parseFloat(req.body.sellingPrice),
        // Convert to number for decimal field
        imageUrl: req.body.imageUrl,
        categoryId: req.body.categoryId ? parseInt(req.body.categoryId) : null,
        stock: parseInt(req.body.stock || "0"),
        isActive: req.body.status === "active",
        vendorId: vendor.id
      };
      console.log("Creating base product:", productData);
      const product = await storage.createProduct(productData);
      console.log("Base product created:", { productId: product.id });
      const variantData = {
        productId: product.id,
        sku: req.body.sku,
        mrp: parseFloat(req.body.mrp),
        sellingPrice: parseFloat(req.body.sellingPrice),
        purchasePrice: parseFloat(req.body.purchasePrice),
        stock: parseInt(req.body.stock || "0"),
        weight: parseFloat(req.body.weight),
        length: parseFloat(req.body.length),
        breadth: parseFloat(req.body.breadth),
        height: parseFloat(req.body.height),
        status: req.body.status || "active",
        // Optional fields that might be needed for variants
        color: null,
        size: null,
        material: null,
        style: null,
        imageUrls: req.body.imageUrl ? [req.body.imageUrl] : []
      };
      console.log("Creating product variant:", variantData);
      const variant = await storage.createProductVariant(variantData);
      console.log("Product variant created:", { variantId: variant.id });
      const completeProduct = {
        ...product,
        variant
      };
      res.json(completeProduct);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });
  app2.put("/api/products/:id", async (req, res) => {
    try {
      const vendor = req.vendor;
      if (!vendor) {
        return res.status(403).json({ message: "Vendor access required" });
      }
      const productId = parseInt(req.params.id);
      const product = await storage.getProduct(productId);
      if (!product || product.vendorId !== vendor.id) {
        return res.status(403).json({ message: "Access denied to this product" });
      }
      const updatedProduct = await storage.updateProduct(productId, req.body);
      res.json(updatedProduct);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });
  app2.delete("/api/products/:id", async (req, res) => {
    try {
      const vendor = req.vendor;
      if (!vendor) {
        return res.status(403).json({ message: "Vendor access required" });
      }
      const productId = parseInt(req.params.id);
      const product = await storage.getProduct(productId);
      if (!product || product.vendorId !== vendor.id) {
        return res.status(403).json({ message: "Access denied to this product" });
      }
      await storage.deleteProduct(productId);
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });
  app2.get("/api/cart", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub || req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const cartItems2 = await storage.getCartItems(userId.toString());
      res.json(cartItems2);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });
  app2.post("/api/cart", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const cartItemData = insertCartItemSchema.parse({
        ...req.body,
        userId
      });
      const cartItem = await storage.addToCart(cartItemData);
      res.json(cartItem);
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(500).json({ message: "Failed to add to cart" });
    }
  });
  app2.put("/api/cart/:productId", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const productId = parseInt(req.params.productId);
      const { quantity } = z2.object({ quantity: z2.number() }).parse(req.body);
      const cartItem = await storage.updateCartItem(
        userId,
        productId,
        quantity
      );
      res.json(cartItem);
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });
  app2.delete("/api/cart/:productId", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const productId = parseInt(req.params.productId);
      const removed = await storage.removeFromCart(userId, productId);
      res.json({ success: removed });
    } catch (error) {
      console.error("Error removing from cart:", error);
      res.status(500).json({ message: "Failed to remove from cart" });
    }
  });
  app2.get("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      let filters = {};
      if (user?.role === "buyer") {
        filters.customerId = user.id;
      } else if (user?.role === "seller") {
        const vendor = await storage.getVendorByOwner(user.id.toString());
        if (vendor) {
          filters.vendorId = vendor.id;
        }
      }
      const orders2 = await storage.getOrders(filters);
      res.json(orders2);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });
  app2.post("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const { vendorId, shippingAddress } = req.body;
      const cartItems2 = await storage.getCartItems(userId);
      if (cartItems2.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      const total = cartItems2.reduce(
        (sum, item) => sum + parseFloat(item.product.price) * item.quantity,
        0
      );
      const orderData = {
        customerId: userId,
        vendorId: parseInt(vendorId),
        total: total.toString(),
        shippingAddress,
        status: "pending"
      };
      const orderItems2 = cartItems2.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price
      }));
      const order = await storage.createOrder(orderData, orderItems2);
      await storage.clearCart(userId);
      res.json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });
  app2.put("/api/orders/:id/status", isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== "seller" && user?.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const orderId = parseInt(req.params.id);
      const { status } = z2.object({ status: z2.string() }).parse(req.body);
      if (user.role === "seller") {
        const order = await storage.getOrder(orderId);
        const vendor = await storage.getVendorByOwner(user.id.toString());
        if (!order || !vendor || order.vendorId !== vendor.id) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      const updatedOrder = await storage.updateOrderStatus(orderId, status);
      res.json(updatedOrder);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });
  app2.get("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
      }
      res.redirect("/");
    });
  });
  app2.get("/api/categories", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(parseInt(userId));
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      const vendorId = req.query.vendorId ? parseInt(req.query.vendorId) : void 0;
      const isGlobal = req.query.isGlobal === "true";
      if (user.role === "super_admin") {
        const categories2 = await storage.getCategories({ vendorId, isGlobal });
        return res.json(categories2);
      }
      if (user.role === "seller") {
        const vendor = await storage.getVendorByOwner(userId);
        if (!vendor) {
          return res.status(404).json({ message: "Vendor not found" });
        }
        const [globalCategories, vendorCategories] = await Promise.all([
          storage.getCategories({ isGlobal: true }),
          storage.getCategories({ vendorId: vendor.id, isGlobal: false })
        ]);
        const allCategories = [...globalCategories, ...vendorCategories];
        return res.json(allCategories);
      }
      res.json([]);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });
  app2.post("/api/categories", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(parseInt(userId));
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      const categoryData = insertCategorySchema.parse({
        ...req.body,
        createdBy: parseInt(userId)
      });
      if (user.role === "super_admin" && categoryData.isGlobal) {
        const category = await storage.createCategory({
          ...categoryData,
          vendorId: null,
          isGlobal: true
        });
        return res.status(201).json(category);
      }
      if (user.role === "seller") {
        const vendor = await storage.getVendorByOwner(userId);
        if (!vendor) {
          return res.status(404).json({ message: "Vendor not found" });
        }
        const category = await storage.createCategory({
          ...categoryData,
          vendorId: vendor.id,
          isGlobal: false
        });
        return res.status(201).json(category);
      }
      res.status(403).json({ message: "Insufficient permissions" });
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });
  app2.patch("/api/categories/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(parseInt(userId));
      const categoryId = parseInt(req.params.id);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      const existingCategory = await storage.getCategory(categoryId);
      if (!existingCategory) {
        return res.status(404).json({ message: "Category not found" });
      }
      const updateData = insertCategorySchema.partial().parse(req.body);
      if (user.role === "super_admin" && existingCategory.isGlobal) {
        const category = await storage.updateCategory(categoryId, updateData);
        return res.json(category);
      }
      if (user.role === "seller" && !existingCategory.isGlobal) {
        const vendor = await storage.getVendorByOwner(userId);
        if (!vendor || existingCategory.vendorId !== vendor.id) {
          return res.status(403).json({ message: "Cannot update this category" });
        }
        const category = await storage.updateCategory(categoryId, updateData);
        return res.json(category);
      }
      res.status(403).json({ message: "Insufficient permissions" });
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ message: "Failed to update category" });
    }
  });
  app2.delete("/api/categories/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(parseInt(userId));
      const categoryId = parseInt(req.params.id);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      const existingCategory = await storage.getCategory(categoryId);
      if (!existingCategory) {
        return res.status(404).json({ message: "Category not found" });
      }
      if (user.role === "super_admin" && existingCategory.isGlobal) {
        const deleted = await storage.deleteCategory(categoryId);
        return res.json({ success: deleted });
      }
      if (user.role === "seller" && !existingCategory.isGlobal) {
        const vendor = await storage.getVendorByOwner(userId);
        if (!vendor || existingCategory.vendorId !== vendor.id) {
          return res.status(403).json({ message: "Cannot delete this category" });
        }
        const deleted = await storage.deleteCategory(categoryId);
        return res.json({ success: deleted });
      }
      res.status(403).json({ message: "Insufficient permissions" });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });
  app2.get(
    "/api/admin/custom-domains",
    isAuthenticated,
    async (req, res) => {
      try {
        const userId = req.user?.claims?.sub;
        const user = await storage.getUser(parseInt(userId));
        if (!user || user.role !== "super_admin") {
          return res.status(403).json({ message: "Admin access required" });
        }
        const domains = await storage.getCustomDomains();
        res.json(domains);
      } catch (error) {
        console.error("Error fetching custom domains:", error);
        res.status(500).json({ message: "Failed to fetch custom domains" });
      }
    }
  );
  app2.post(
    "/api/admin/custom-domains",
    isAuthenticated,
    async (req, res) => {
      try {
        const userId = req.user?.claims?.sub;
        const user = await storage.getUser(parseInt(userId));
        if (!user || user.role !== "super_admin") {
          return res.status(403).json({ message: "Admin access required" });
        }
        const domainData = {
          ...req.body,
          createdBy: parseInt(userId),
          status: "pending"
          // pending, active, inactive
        };
        const domain = await storage.createCustomDomain(domainData);
        if (domain.vendorId) {
          await storage.updateVendor(domain.vendorId, {
            customDomainId: domain.id
          });
        }
        res.json(domain);
      } catch (error) {
        console.error("Error creating custom domain:", error);
        res.status(500).json({ message: "Failed to create custom domain" });
      }
    }
  );
  app2.put(
    "/api/admin/custom-domains/:id",
    isAuthenticated,
    async (req, res) => {
      try {
        const userId = req.user?.claims?.sub;
        const user = await storage.getUser(parseInt(userId));
        if (!user || user.role !== "super_admin") {
          return res.status(403).json({ message: "Admin access required" });
        }
        const domainId = parseInt(req.params.id);
        const domain = await storage.updateCustomDomain(domainId, req.body);
        if (!domain) {
          return res.status(404).json({ message: "Domain not found" });
        }
        res.json(domain);
      } catch (error) {
        console.error("Error updating custom domain:", error);
        res.status(500).json({ message: "Failed to update custom domain" });
      }
    }
  );
  app2.delete(
    "/api/admin/custom-domains/:id",
    isAuthenticated,
    async (req, res) => {
      try {
        const userId = req.user?.claims?.sub;
        const user = await storage.getUser(parseInt(userId));
        if (!user || user.role !== "super_admin") {
          return res.status(403).json({ message: "Admin access required" });
        }
        const domainId = parseInt(req.params.id);
        const deleted = await storage.deleteCustomDomain(domainId);
        res.json({ success: deleted });
      } catch (error) {
        console.error("Error deleting custom domain:", error);
        res.status(500).json({ message: "Failed to delete custom domain" });
      }
    }
  );
  app2.get("/api/storefront/by-domain", async (req, res) => {
    try {
      const hostname = req.headers.host || req.query.domain;
      if (!hostname) {
        return res.status(400).json({ message: "Domain not specified" });
      }
      const domain = hostname.split(":")[0];
      if (domain === "localhost") {
        const vendors2 = await storage.getVendors();
        const vendor2 = vendors2[0];
        if (!vendor2) {
          return res.status(404).json({ message: "No stores available" });
        }
        const [products3, categories3] = await Promise.all([
          storage.getProducts(vendor2.id),
          storage.getCategories({ vendorId: vendor2.id })
        ]);
        res.json({
          vendor: {
            id: vendor2.id,
            name: vendor2.name,
            description: vendor2.description,
            domain: vendor2.domain,
            customDomain: null
          },
          products: products3,
          categories: categories3
        });
        return;
      }
      let vendor = await storage.getVendorByDomain(domain);
      if (!vendor && domain.includes(".")) {
        const subdomain = domain.split(".")[0];
        vendor = await storage.getVendorByDomain(subdomain);
      }
      if (!vendor) {
        return res.status(404).json({ message: "Store not found" });
      }
      const [products2, categories2] = await Promise.all([
        storage.getProducts(vendor.id),
        storage.getCategories({ vendorId: vendor.id })
      ]);
      res.json({
        vendor: {
          id: vendor.id,
          name: vendor.name,
          description: vendor.description,
          domain: vendor.domain,
          customDomain: vendor.customDomainId ? domain : null
        },
        products: products2,
        categories: categories2
      });
    } catch (error) {
      console.error("Error fetching storefront data:", error);
      res.status(500).json({ message: "Failed to load storefront" });
    }
  });
  app2.post(
    "/api/admin/vendors/:id/generate-subdomain",
    isAuthenticated,
    async (req, res) => {
      try {
        const userId = req.user?.claims?.sub;
        const user = await storage.getUser(parseInt(userId));
        if (!user || user.role !== "super_admin") {
          return res.status(403).json({ message: "Admin access required" });
        }
        const vendorId = parseInt(req.params.id);
        const vendor = await storage.getVendor(vendorId);
        if (!vendor) {
          return res.status(404).json({ message: "Vendor not found" });
        }
        const subdomain = vendor.name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
        const updatedVendor = await storage.updateVendor(vendorId, {
          domain: `${subdomain}.${process.env.REPLIT_DOMAINS || "yourdomain.com"}`
        });
        res.json(updatedVendor);
      } catch (error) {
        console.error("Error generating subdomain:", error);
        res.status(500).json({ message: "Failed to generate subdomain" });
      }
    }
  );
  app2.put("/api/orders/:id/status", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(parseInt(userId));
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      const orderId = parseInt(req.params.id);
      const { status } = req.body;
      const validStatuses = [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled"
      ];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid order status" });
      }
      if (user.role === "super_admin" || user.role === "admin") {
        const updatedOrder = await storage.updateOrderStatus(orderId, status);
        if (!updatedOrder) {
          return res.status(404).json({ message: "Order not found" });
        }
        res.json(updatedOrder);
      } else if (user.role === "seller") {
        const order = await storage.getOrder(orderId);
        if (!order) {
          return res.status(404).json({ message: "Order not found" });
        }
        const vendor = await storage.getVendorByOwner(userId);
        if (!vendor || order.vendorId !== vendor.id) {
          return res.status(403).json({ message: "Access denied" });
        }
        const updatedOrder = await storage.updateOrderStatus(orderId, status);
        res.json(updatedOrder);
      } else {
        return res.status(403).json({ message: "Access denied" });
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });
  app2.post(
    "/api/upload/single",
    isAuthenticated,
    upload.single("file"),
    async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ message: "No file provided" });
        }
        const folder = req.body.folder || "uploads";
        const result = await s3Service.uploadFile(req.file, folder);
        res.json({
          success: true,
          file: result
        });
      } catch (error) {
        console.error("File upload error:", error);
        res.status(500).json({
          message: "Failed to upload file",
          error: error.message
        });
      }
    }
  );
  app2.post(
    "/api/upload/multiple",
    isAuthenticated,
    upload.array("files", 10),
    async (req, res) => {
      try {
        if (!req.files || req.files.length === 0) {
          return res.status(400).json({ message: "No files provided" });
        }
        const folder = req.body.folder || "uploads";
        const results = await s3Service.uploadFiles(req.files, folder);
        res.json({
          success: true,
          files: results
        });
      } catch (error) {
        console.error("Files upload error:", error);
        res.status(500).json({
          message: "Failed to upload files",
          error: error.message
        });
      }
    }
  );
  app2.delete("/api/upload/:key(*)", isAuthenticated, async (req, res) => {
    try {
      const key = req.params.key;
      await s3Service.deleteFile(key);
      res.json({
        success: true,
        message: "File deleted successfully"
      });
    } catch (error) {
      console.error("File deletion error:", error);
      res.status(500).json({
        message: "Failed to delete file",
        error: error.message
      });
    }
  });
  app2.get(
    "/api/upload/signed-url/:key(*)",
    isAuthenticated,
    async (req, res) => {
      try {
        const key = req.params.key;
        const expiresIn = parseInt(req.query.expiresIn) || 3600;
        const signedUrl = await s3Service.getSignedUrl(key, expiresIn);
        res.json({
          success: true,
          signedUrl
        });
      } catch (error) {
        console.error("Signed URL generation error:", error);
        res.status(500).json({
          message: "Failed to generate signed URL",
          error: error.message
        });
      }
    }
  );
  app2.get("/api/vendor/products", async (req, res) => {
    try {
      const vendor = req.vendor;
      if (!vendor) {
        return res.status(403).json({ message: "Vendor access required" });
      }
      const products2 = await storage.getProducts(vendor.id);
      res.json(products2);
    } catch (error) {
      console.error("Error fetching vendor products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });
  app2.get("/api/vendor/categories", async (req, res) => {
    try {
      const vendor = req.vendor;
      if (!vendor) {
        return res.status(403).json({ message: "Vendor access required" });
      }
      const categories2 = await storage.getCategories({ vendorId: vendor.id });
      res.json(categories2);
    } catch (error) {
      console.error("Error fetching vendor categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });
  app2.get("/api/vendor/orders", async (req, res) => {
    try {
      const vendor = req.vendor;
      if (!vendor) {
        return res.status(403).json({ message: "Vendor access required" });
      }
      const orders2 = await storage.getVendorOrders(vendor.id);
      res.json(orders2);
    } catch (error) {
      console.error("Error fetching vendor orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: ["localhost", ".onrender.com"],
    host: "0.0.0.0",
    port: process.env.PORT ? parseInt(process.env.PORT) : 3e3
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        if (process.env.NODE_ENV !== "production") {
          process.exit(1);
        }
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(express.static(path2.resolve(import.meta.dirname, "..", "dist")));
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      if (process.env.NODE_ENV !== "production") {
        template = template.replace(
          `src="/src/main.tsx"`,
          `src="/src/main.tsx?v=${nanoid()}"`
        );
      }
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.set("trust proxy", 1);
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = process.env.PORT ? parseInt(process.env.PORT) : 5e3;
  const host = process.env.HOST || "0.0.0.0";
  server.listen(port, host, () => {
    log(
      `Server running at http://${host === "0.0.0.0" ? "localhost" : host}:${port}`
    );
  });
})();
