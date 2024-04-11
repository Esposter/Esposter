import { MIGRATIONS_FOLDER_PATH } from "@/db/constants";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "db/schema",
  out: MIGRATIONS_FOLDER_PATH,
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL,
  },
});
