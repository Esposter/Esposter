import type { ApiKeyPermissions } from "#shared/models/auth/ApiKeyPermissions";
import type { Database } from "@esposter/db-schema";

import { McpScope } from "#shared/models/auth/McpScope";
import { apiKeysInAuth } from "@esposter/db-schema";
import { isNull } from "drizzle-orm";

// Keys made before scopes existed were made for the follow-ups, the only tools there were, and hold no permissions, which
// The endpoint reads as no scope. Each is given the follow-ups scope and nothing else. A key already holding permissions is
// Left as it is, and a rerun finds none with null permissions, so every startup runs it
export const grantFollowUpsToKeysBeforeScopes = async (db: Database) => {
  const permissions = JSON.stringify({ mcp: [McpScope.FollowUps] } satisfies ApiKeyPermissions);
  await db.update(apiKeysInAuth).set({ permissions }).where(isNull(apiKeysInAuth.permissions));
};
