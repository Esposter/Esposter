import { defineConfig } from "drizzle-kit";

// The `streams` D1 database, the Azure Table data's new home. Its migrations are a folder of their own, applied to the
// `streams` binding the same way `core` is; the account, database and token come from the environment the deploy sets
export default defineConfig({
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
    databaseId: process.env.CLOUDFLARE_D1_STREAMS_DATABASE_ID,
    token: process.env.CLOUDFLARE_API_TOKEN,
  },
  dialect: "sqlite",
  driver: "d1-http",
  out: "../../apps/web/server/db/migrations/streams",
  schema: "src/streams/streamTables.ts",
});
