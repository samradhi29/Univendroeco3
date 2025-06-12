import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@shared/schema";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Configure WebSocket for Neon
try {
  neonConfig.webSocketConstructor = ws;
} catch (error) {
  console.error("Failed to configure WebSocket:", error);
  throw new Error(
    "WebSocket configuration failed. This is required for Neon serverless."
  );
}

// Validate database URL
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL environment variable is not set. Please check your .env file and ensure it contains a valid Neon database URL."
  );
}

// Validate URL format
if (
  !databaseUrl.startsWith("postgres://") &&
  !databaseUrl.startsWith("postgresql://")
) {
  throw new Error(
    "Invalid DATABASE_URL format. It should start with 'postgres://' or 'postgresql://'"
  );
}

// Create connection pool with error handling
let pool: Pool;
try {
  pool = new Pool({
    connectionString: databaseUrl,
    // Add connection timeout
    connectionTimeoutMillis: 5000,
    // Add max connections
    max: 10,
  });
} catch (error) {
  console.error("Failed to create database pool:", error);
  throw new Error(
    "Database connection failed. Please check your connection string and network."
  );
}

// Test the connection
pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

// Export the database instance
export { pool };
export const db = drizzle(pool, { schema });

// Optional: Add a function to test the connection
export async function testConnection() {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("Database connection successful:", result.rows[0]);
    return true;
  } catch (error) {
    console.error("Database connection test failed:", error);
    return false;
  }
}
