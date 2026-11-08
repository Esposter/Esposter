import { WRITE_SAS_DURATION_MS } from "@esposter/db-schema";
import { ID_SEPARATOR } from "@esposter/shared";
import { createHmac } from "node:crypto";

// The composer's revert is the one blob delete that cannot be authorized from persisted state: the upload it
// Reclaims is referenced by no message, so there is nothing to check ownership against. The grant is signed
// Instead — every member of a room can read every attachment's id off the wire, so a name-only delete would let
// Any of them destroy anyone's posted attachment. It expires with the write SAS, which bounds the grant rather
// Than closing it (openspec/specs/architecture/blob-lifecycle/design.md), and the expiry is signed with the rest
// So it cannot be edited
export const createUploadFileToken = (
  userId: string,
  roomId: string,
  id: string,
  expiresAt: number = Date.now() + WRITE_SAS_DURATION_MS,
): string =>
  `${expiresAt}${ID_SEPARATOR}${createHmac("sha256", process.env.BETTER_AUTH_SECRET)
    .update([userId, roomId, id, expiresAt].join(ID_SEPARATOR))
    .digest("base64url")}`;
