import type { Config } from "drizzle-kit";

export default {
  schema: "db/schema",
  // We need the migrations folder in the production build
  // for drizzle to access when running migrations
  out: "public/db/migrations",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL,
  },
} satisfies Config;
