import { authSchema } from "#src/schema/auth/authSchema";
import { usersInAuth } from "#src/schema/auth/usersInAuth";
import { sqliteTable } from "#src/sqliteTable";
import { index, integer, text } from "drizzle-orm/sqlite-core";

// Better-auth's API key plugin's own model, declared here because its drizzle adapter writes to the schema it is
// Handed. Every column is the plugin's, nullable where the plugin leaves a field absent, and its schema check fails a
// Test the day a field moves. The key is stored hashed; an agent authenticates with one at the MCP endpoint
export const apiKeysInAuth = sqliteTable(
  "apiKeys",
  {
    configId: text().notNull().default("default"),
    enabled: integer({ mode: "boolean" }).default(true),
    expiresAt: integer({ mode: "timestamp_ms" }),
    id: text().primaryKey(),
    key: text().notNull(),
    lastRefillAt: integer({ mode: "timestamp_ms" }),
    lastRequest: integer({ mode: "timestamp_ms" }),
    metadata: text(),
    name: text(),
    permissions: text(),
    prefix: text(),
    rateLimitEnabled: integer({ mode: "boolean" }).default(true),
    rateLimitMax: integer(),
    rateLimitTimeWindow: integer(),
    // The key's owner: the plugin's keys reference a user here, never an organization
    referenceId: text()
      .notNull()
      .references(() => usersInAuth.id, { onDelete: "cascade" }),
    refillAmount: integer(),
    refillInterval: integer(),
    remaining: integer(),
    requestCount: integer().default(0),
    start: text(),
  },
  {
    extraConfig: ({ configId, key, referenceId }) => [
      index("apiKeys_configId_index").on(configId),
      index("apiKeys_key_index").on(key),
      index("apiKeys_referenceId_index").on(referenceId),
    ],
    schema: authSchema,
  },
);
