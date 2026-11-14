import { defineConfig } from "drizzle-kit";

// The room object's SQLite storage. Its schema and its migrations live here beside each other.
// The realtime Worker migrates from the folder, which `db:gen` writes one object at a time (openspec/changes/infra-cloudflare-realtime)
export default defineConfig({
  dialect: "sqlite",
  driver: "durable-sqlite",
  out: "./src/objects/room/migrations",
  schema: "./src/objects/room/schema.ts",
});
