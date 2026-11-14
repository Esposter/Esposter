import type { CallBackgroundBlob } from "#server/models/message/call/CallBackgroundBlob";
import type { R2Bucket } from "@cloudflare/workers-types";
import type { UserInAuth } from "@esposter/db-schema";

import { getCallBackgroundPrefix } from "#server/services/message/call/getCallBackgroundPrefix";
import { MAX_CALL_BACKGROUNDS } from "#shared/services/message/constants";

// The listing is the whole index. A slot's blob name holds its number, and the size the listing already carries is the
// Size the background takes - so a background needs no row, no id and nothing to reconcile, and reading the set back
// Costs one request per page rather than one per slot
export const readCallBackgroundBlobs = async (
  bucket: R2Bucket,
  userId: UserInAuth["id"],
): Promise<CallBackgroundBlob[]> => {
  const prefix = getCallBackgroundPrefix(userId);
  const callBackgroundBlobs: CallBackgroundBlob[] = [];
  let cursor: string | undefined;
  do {
    // oxlint-disable-next-line no-await-in-loop -- Each page's cursor is what the next page is requested with
    const page = await bucket.list({ cursor, prefix });
    for (const { key, size } of page.objects) {
      const slotName = key.slice(prefix.length);
      const slot = Number(slotName);
      // Only the names this router mints are backgrounds. Anything else under the prefix can never be rendered
      // Or replaced through a slot, so it is passed over rather than listed - and never reclaimed on a guess
      if (!Number.isInteger(slot) || String(slot) !== slotName || slot < 0 || slot >= MAX_CALL_BACKGROUNDS) continue;

      callBackgroundBlobs.push({ contentLength: size, name: key, slot });
    }
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);

  return callBackgroundBlobs;
};
