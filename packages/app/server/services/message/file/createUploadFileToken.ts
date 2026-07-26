import { dayjs } from "#shared/services/dayjs";
import { WRITE_SAS_DURATION_MS } from "@esposter/db-schema";
import { ID_SEPARATOR } from "@esposter/shared";
import { createHmac } from "node:crypto";

// The composer's revert is the one blob delete that cannot be authorized from persisted state: the upload it
// Reclaims is referenced by no message, so there is nothing to check ownership against. The grant is signed
// Instead — every member of a room can read every attachment's id off the wire, so a name-only delete would let
// Any of them destroy anyone's posted attachment. Only the member the write SAS was minted for holds this.
// It expires with that SAS: past it the upload has either landed on a message — where the blob is the message's
// To delete, not a loose upload's — or been abandoned, and a grant that outlived both would delete a posted
// Attachment out from under the message still listing it. The expiry is signed with the rest, so it cannot be
// Edited; verification re-mints against the presented one
export const createUploadFileToken = (
  userId: string,
  roomId: string,
  id: string,
  expiresAt: number = dayjs().add(WRITE_SAS_DURATION_MS, "ms").valueOf(),
): string =>
  `${expiresAt}${ID_SEPARATOR}${createHmac("sha256", useRuntimeConfig().auth.secret)
    .update([userId, roomId, id, expiresAt].join(ID_SEPARATOR))
    .digest("base64url")}`;
