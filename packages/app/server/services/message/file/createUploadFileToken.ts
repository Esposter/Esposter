import { dayjs } from "#shared/services/dayjs";
import { WRITE_SAS_DURATION_MS } from "@esposter/db-schema";
import { ID_SEPARATOR } from "@esposter/shared";
import { createHmac } from "node:crypto";

// The composer's revert is the one blob delete that cannot be authorized from persisted state: the upload it
// Reclaims is referenced by no message, so there is nothing to check ownership against. The grant is signed
// Instead — every member of a room can read every attachment's id off the wire, so a name-only delete would let
// Any of them destroy anyone's posted attachment. Only the member the write SAS was minted for holds this.
// It expires with the write SAS, which bounds the grant rather than closing it — see
// /docs/architecture/blob-lifecycle. The expiry is signed with the rest, so it cannot be edited; verification
// Re-mints against the presented one
export const createUploadFileToken = (
  userId: string,
  roomId: string,
  id: string,
  expiresAt: number = dayjs().add(WRITE_SAS_DURATION_MS, "ms").valueOf(),
): string => {
  // Nuxt bakes runtimeConfig at BUILD time and only re-reads `NUXT_`-prefixed vars at runtime, so a deployment
  // That builds without the secret and supplies it as a runtime app setting leaves this undefined — which
  // `createHmac` rejects outright, 500ing every upload with an arg-type error that names nothing useful. Fall
  // Back to the process env better-auth itself reads, and fail loudly if neither has it
  const secret = useRuntimeConfig().auth.secret || process.env.BETTER_AUTH_SECRET;
  if (!secret)
    throw new Error("BETTER_AUTH_SECRET is not set — upload grants cannot be signed. Set it in the environment.");
  return `${expiresAt}${ID_SEPARATOR}${createHmac("sha256", secret)
    .update([userId, roomId, id, expiresAt].join(ID_SEPARATOR))
    .digest("base64url")}`;
};
