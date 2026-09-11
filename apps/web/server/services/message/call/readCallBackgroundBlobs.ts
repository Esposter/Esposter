import type { CallBackgroundBlob } from "@@/server/models/message/call/CallBackgroundBlob";
import type { ContainerClient } from "@azure/storage-blob";
import type { User } from "@esposter/db-schema";

import { MAX_CALL_BACKGROUNDS } from "#shared/services/message/constants";
import { getCallBackgroundPrefix } from "@@/server/services/message/call/getCallBackgroundPrefix";
import { AZURE_MAX_PAGE_SIZE } from "@esposter/azure";

// The listing is the whole index. A slot's blob name holds its number, and the properties the listing already
// Carries hold the size and content type - so a background needs no row, no id and nothing to reconcile, and
// Reading the set back costs one request rather than one per slot
export const readCallBackgroundBlobs = async (
  containerClient: ContainerClient,
  userId: User["id"],
): Promise<CallBackgroundBlob[]> => {
  const prefix = getCallBackgroundPrefix(userId);
  const callBackgroundBlobs: CallBackgroundBlob[] = [];
  const pages = containerClient.listBlobsFlat({ prefix }).byPage({ maxPageSize: AZURE_MAX_PAGE_SIZE });

  for await (const { segment } of pages)
    for (const { name, properties } of segment.blobItems) {
      const slotName = name.slice(prefix.length);
      const slot = Number(slotName);
      // Only the names this router mints are backgrounds. Anything else under the prefix can never be rendered
      // Or replaced through a slot, so it is passed over rather than listed - and never reclaimed on a guess
      if (String(slot) !== slotName || slot < 0 || slot >= MAX_CALL_BACKGROUNDS) continue;

      callBackgroundBlobs.push({ contentLength: properties.contentLength ?? 0, name, slot });
    }

  return callBackgroundBlobs;
};
