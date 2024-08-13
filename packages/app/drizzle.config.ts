import { MIGRATIONS_FOLDER_PATH } from "@/db/constants";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dbCredentials: { url: process.env.DATABASE_URL },
  dialect: "postgresql",
  out: MIGRATIONS_FOLDER_PATH,
  schema: "db/schema",
});
