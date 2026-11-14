import { CloudflareCoreDatabaseIdMap } from "#src/services/cloudflare/CloudflareCoreDatabaseIdMap";
import { CLOUDFLARE_ACCOUNT_ID } from "#src/services/cloudflare/constants";
import { defineConfig } from "drizzle-kit";

// The `core` D1 database. `db:migrate` applies through D1's HTTP API, so the token comes from the environment the deploy
// job sets, and the account and the database are committed: the database is the one `CLOUDFLARE_ENVIRONMENT` names.
// `db:gen` reads none of them, so an unset environment is no database rather than an error. Local development applies the
// same folder with `wrangler d1 migrations apply`
const databaseIds: Partial<Record<string, string>> = CloudflareCoreDatabaseIdMap;
const environment = process.env.CLOUDFLARE_ENVIRONMENT || "";

export default defineConfig({
  dbCredentials: {
    accountId: CLOUDFLARE_ACCOUNT_ID,
    databaseId: databaseIds[environment] || "",
    token: process.env.CLOUDFLARE_API_TOKEN || "",
  },
  dialect: "sqlite",
  driver: "d1-http",
  out: "../../apps/web/server/db/migrations/core",
  schema: "src/schema/**/*.ts",
});
