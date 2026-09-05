import { WRITE_SAS_DURATION_MS } from "@esposter/db-schema";
import { ID_SEPARATOR, NotInitializedError } from "@esposter/shared";
import { createHmac } from "node:crypto";

// The composer's revert is the one blob delete that cannot be authorized from persisted state: the upload it
// Reclaims is referenced by no message, so there is nothing to check ownership against. The grant is signed
// Instead — every member of a room can read every attachment's id off the wire, so a name-only delete would let
// Any of them destroy anyone's posted attachment. It expires with the write SAS, which bounds the grant rather
// Than closing it (/docs/architecture/blob-lifecycle), and the expiry is signed with the rest so it cannot be
// Edited
export const createUploadFileToken = (
  userId: string,
  roomId: string,
  id: string,
  expiresAt: number = Date.now() + WRITE_SAS_DURATION_MS,
): string => {
  // Nuxt bakes runtimeConfig at BUILD time and only re-reads `NUXT_`-prefixed vars at runtime, so a deployment
  // That builds without the secret and supplies it as a runtime app setting leaves this undefined — which
  // `createHmac` rejects outright, 500ing every upload with an arg-type error that names nothing useful. Fall
  // Back to the process env better-auth itself reads, and fail loudly if neither has it
  const secret = useRuntimeConfig().auth.secret || process.env.BETTER_AUTH_SECRET;
  if (!secret) throw new NotInitializedError("BETTER_AUTH_SECRET");
  return `${expiresAt}${ID_SEPARATOR}${createHmac("sha256", secret)
    .update([userId, roomId, id, expiresAt].join(ID_SEPARATOR))
    .digest("base64url")}`;
};
