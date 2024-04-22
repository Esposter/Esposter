import { MIGRATIONS_FOLDER_PATH } from "@/db/constants";
import { env } from "@/env.server";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "db/schema",
  out: MIGRATIONS_FOLDER_PATH,
  driver: "pg",
  dbCredentials: {
    connectionString: env.DATABASE_URL,
  },
});
