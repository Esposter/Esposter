import { ID_SEPARATOR } from "@esposter/shared";
import { createHmac } from "node:crypto";

// The composer's revert is the one blob delete that cannot be authorized from persisted state: the upload it
// Reclaims is referenced by no message, so there is nothing to check ownership against. The grant is signed
// Instead — every member of a room can read every attachment's id off the wire, so a name-only delete would let
// Any of them destroy anyone's posted attachment. Only the member the write SAS was minted for holds this
export const createUploadFileToken = (userId: string, roomId: string, id: string): string =>
  createHmac("sha256", useRuntimeConfig().auth.secret)
    .update([userId, roomId, id].join(ID_SEPARATOR))
    .digest("base64url");
