import type { Config } from "drizzle-kit";

export default {
  schema: "./db/schema",
  out: "./db/migrations",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL,
  },
} satisfies Config;
