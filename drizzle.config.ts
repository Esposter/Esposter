import { MIGRATIONS_FOLDER_PATH } from "@/db/constants";
import { env } from "@/env.server";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  dbCredentials: { url: env.DATABASE_URL },
  schema: "db/schema",
  out: MIGRATIONS_FOLDER_PATH,
});
