import { pgTable } from "#src/pgTable";
import { authSchema } from "#src/schema/auth/authSchema";
import { usersInAuth } from "#src/schema/auth/usersInAuth";
import { boolean, index, integer, text, timestamp } from "drizzle-orm/pg-core";

// Better-auth's API key plugin's own model, declared here because its drizzle adapter writes to the schema it is
// Handed. Every column is the plugin's, nullable where the plugin leaves a field absent, and its schema check fails a
// Test the day a field moves. The key is stored hashed; an agent authenticates with one at the MCP endpoint
export const apiKeysInAuth = pgTable(
  "apiKeys",
  {
    configId: text().notNull().default("default"),
    enabled: boolean().default(true),
    expiresAt: timestamp(),
    id: text().primaryKey(),
    key: text().notNull(),
    lastRefillAt: timestamp(),
    lastRequest: timestamp(),
    metadata: text(),
    name: text(),
    permissions: text(),
    prefix: text(),
    rateLimitEnabled: boolean().default(true),
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
