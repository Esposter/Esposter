import { defineConfig } from "drizzle-kit";

// The `core` D1 database. `db:migrate` applies through D1's HTTP API, so the account, database and token come from
// The environment the deploy job sets; local development applies the same folder with `wrangler d1 migrations apply`
export default defineConfig({
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
    databaseId: process.env.CLOUDFLARE_D1_CORE_DATABASE_ID,
    token: process.env.CLOUDFLARE_API_TOKEN,
  },
  dialect: "sqlite",
  driver: "d1-http",
  out: "../../apps/web/server/db/migrations",
  schema: "src/schema/**/*.ts",
});
