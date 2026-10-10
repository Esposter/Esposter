import type { GenshinSave } from "genshin-world/save";

import { useContainerClient } from "#server/composables/azure/container/useContainerClient";
import { getSaveBlobName } from "#server/services/blobState/getSaveBlobName";
import { writeBlobState } from "#server/services/blobState/writeBlobState";
import { saveGenshin } from "#server/services/genshin/saveGenshin";
import { transformer } from "#shared/services/trpc/transformer";
import { AzureContainer } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { EMPTY_GENSHIN_SAVE, genshinSaveSchema, MAX_INVENTORY_ITEM_COUNT } from "genshin-world/save";
import { describe, test } from "vitest";

// The bag is the one collection that reaches its ceiling, so its entry count is the scale: a typical bag,
// Then the most the schema admits
const BENCH_BAG_ENTRY_COUNTS = [1000, MAX_INVENTORY_ITEM_COUNT];
// The ETag a save is sent under, and one the blob never carries, which a write under it is refused for
const SAVE_ETAG = '"save"';
const STALE_ETAG = '"stale"';
// A save whose bag holds the given number of stacks, with the rest of it a new player's
const createSave = (bagEntryCount: number): GenshinSave => ({
  ...EMPTY_GENSHIN_SAVE,
  inventory: {
    items: Array.from({ length: bagEntryCount }, (_value, index) => ({ id: index, itemId: index + 1, quantity: 1 })),
    nextId: bagEntryCount,
  },
});
// Azure acknowledges every write with an ETag, and the next write of the session is conditioned on it
const getAcknowledgedEtag = (etag: string | undefined) => {
  if (etag === undefined)
    throw new InvalidOperationError(Operation.Update, "genshin save", "the write was acknowledged without an ETag");

  return etag;
};

// The client's share of a save before it is sent: the stringify that compares it with the last save it stored,
// The schema it passes before the send, and the request body the send encodes. The network's time is the host's,
// So the send is measured as the body it puts on the wire
describe("client stringify and send", () => {
  test.for(BENCH_BAG_ENTRY_COUNTS)("%i bag entries", async (bagEntryCount, { bench }) => {
    const save = createSave(bagEntryCount);
    const sessionId = crypto.randomUUID();
    await bench.compare(
      bench("stringify", () => {
        JSON.stringify(save);
      }),
      bench("validate", () => {
        genshinSaveSchema.safeParse(save);
      }),
      bench("request body", () => {
        JSON.stringify(transformer.serialize({ etag: SAVE_ETAG, save, sessionId }));
      }),
      BENCHMARK_RUN_OPTIONS,
    );
  });
});

// The server's share of a save at each scale. A write under the ETag its session last got is one PUT, and a write
// Refused under a stale ETag is the 412 path: one read, then the rewrite under the fresh ETag. Each task has a blob
// Of its own, and the PUT threads the ETag each write returns into the next one, as a session's saves do. The save
// Is read-only, so it is built once per scale
describe(saveGenshin, () => {
  test.for(BENCH_BAG_ENTRY_COUNTS)("%i bag entries", async (bagEntryCount, { bench }) => {
    const save = createSave(bagEntryCount);
    const sessionId = crypto.randomUUID();
    const containerClient = await useContainerClient(AzureContainer.GenshinAssets);
    const putUserId = crypto.randomUUID();
    const conflictUserId = crypto.randomUUID();
    const serializedEnvelope = JSON.stringify({ save, sessionId });
    let putEtag = getAcknowledgedEtag(
      await writeBlobState(containerClient, getSaveBlobName(putUserId), serializedEnvelope, undefined),
    );
    await writeBlobState(containerClient, getSaveBlobName(conflictUserId), serializedEnvelope, undefined);
    await bench.compare(
      bench("PUT under its ETag", async () => {
        const written = await saveGenshin(putUserId, { etag: putEtag, save, sessionId });
        putEtag = getAcknowledgedEtag(written.etag);
      }),
      bench("412, then a rewrite", async () => {
        await saveGenshin(conflictUserId, { etag: STALE_ETAG, save, sessionId });
      }),
      BENCHMARK_RUN_OPTIONS,
    );
  });
});
