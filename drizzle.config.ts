import { defineConfig } from "drizzle-kit";
import { MIGRATIONS_FOLDER_PATH } from "./db/constants";

export default defineConfig({
  schema: "db/schema",
  out: MIGRATIONS_FOLDER_PATH,
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL,
  },
});
