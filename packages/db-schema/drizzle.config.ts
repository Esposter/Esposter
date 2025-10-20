import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dbCredentials: { url: process.env.DATABASE_URL },
  dialect: "postgresql",
  out: "../app/server/db/migrations",
  schema: "src/schema",
});
