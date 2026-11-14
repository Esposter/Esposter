import { defineConfig } from "drizzle-kit";

// The call object's SQLite storage. Its schema is written in its own folder under the functions Worker, and its migrations
// Are generated into the folder the object migrates from, one object at a time (openspec/changes/infra-cloudflare-realtime)
export default defineConfig({
  dialect: "sqlite",
  driver: "durable-sqlite",
  out: "../../apps/functions/src/durableObjects/call/migrations",
  schema: "../../apps/functions/src/durableObjects/call/schema.ts",
});
