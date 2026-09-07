import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dbCredentials: { url: process.env.DATABASE_URL },
  dialect: "postgresql",
  out: "../../apps/web/server/db/migrations",
  schema: "src/schema",
});
