import { MIGRATIONS_FOLDER_PATH, SCHEMA_FOLDER_PATH } from "#shared/db/constants";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dbCredentials: { url: process.env.DATABASE_URL },
  dialect: "postgresql",
  out: MIGRATIONS_FOLDER_PATH,
  schema: SCHEMA_FOLDER_PATH,
});
