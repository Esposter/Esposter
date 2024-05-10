import { MIGRATIONS_FOLDER_PATH } from "@/db/constants";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  schema: "db/schema",
  out: MIGRATIONS_FOLDER_PATH,
});
