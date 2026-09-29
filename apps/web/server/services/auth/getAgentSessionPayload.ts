import type { GetSessionPayload } from "#shared/models/auth/GetSessionPayload";
import type { User } from "better-auth";

// An agent acts as its API key's owner, from a device of its own. The session is never stored and authenticates
// Nothing, since the key already did: it exists so a write carries a device the owner's open tabs take as another's,
// And so every procedure reads the one context shape a signed-in call has
export const getAgentSessionPayload = (user: User, apiKeyId: string): GetSessionPayload => {
  const now = new Date();
  return {
    session: { createdAt: now, expiresAt: now, id: `agent-${apiKeyId}`, token: "", updatedAt: now, userId: user.id },
    user,
  };
};
