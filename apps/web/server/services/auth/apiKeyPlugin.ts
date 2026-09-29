import type { schema } from "@esposter/db-schema";

import { API_KEY_NAME_MAX_LENGTH } from "#shared/services/auth/constants";
import { standardRateLimiter } from "@@/server/services/rateLimiter/standardRateLimiter";
import { apiKey } from "@better-auth/api-key";

// The keys an agent authenticates with at the MCP endpoint. Shared with the adapter's test so better-auth's schema
// Check covers the table the app actually writes
export const apiKeyPlugin = apiKey({
  // Written out although it is the plugin's default: a key opening a session would open every procedure in the app's
  // Own tRPC route to it, where the MCP endpoint verifies a key itself and reaches only the procedures that opt in
  enableSessionForAPIKeys: false,
  maximumNameLength: API_KEY_NAME_MAX_LENGTH,
  // A drain calls a tool per step, so a key spends from the budget a signed-in caller has rather than the plugin's
  // Default of ten a day
  rateLimit: {
    enabled: true,
    maxRequests: standardRateLimiter.points,
    timeWindow: Temporal.Duration.from({ seconds: standardRateLimiter.duration }).total("milliseconds"),
  },
  // A key is told apart from the owner's others only by its name in the settings list
  requireName: true,
  // Pointed at its export, as every core model is (`authModelOptions`)
  schema: { apikey: { modelName: "apiKeysInAuth" satisfies keyof typeof schema } },
});
