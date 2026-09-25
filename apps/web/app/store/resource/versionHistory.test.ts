// @vitest-environment nuxt
import { createResourceListItem } from "@/services/resource/list/createResourceListItem.test";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useResourceStore } from "@/store/resource";
import { useVersionHistoryStore } from "@/store/resource/versionHistory";
import { SnapshotChannel } from "@esposter/db-schema";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(useVersionHistoryStore, () => {
  const server = setupMswTrpc();

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  // Reads of two resources are two keys, so neither supersedes the other and the first one issued can land after
  // The second. Filed under whichever resource is open when it lands, it lists the one left behind as this one's
  test("files a history that lands after a switch under the resource it was read for", async () => {
    expect.hasAssertions();

    const { promise: readGate, resolve: releaseRead } = Promise.withResolvers<void>();
    const firstResource = createResourceListItem();
    const secondResource = createResourceListItem();
    server.use(
      trpcMsw.resource.readSnapshotHistory.query(async ({ input }) => {
        if (input.id === firstResource.id) await readGate;
        return [
          {
            channel: SnapshotChannel.Revisions,
            isCurrent: false,
            summary: input.id,
            takenAt: new Date(0),
            version: 0,
          },
        ];
      }),
    );
    const resourceStore = useResourceStore();
    const { resource } = storeToRefs(resourceStore);
    const versionHistoryStore = useVersionHistoryStore();
    const { versions } = storeToRefs(versionHistoryStore);
    const { readSnapshotHistory } = versionHistoryStore;
    resource.value = firstResource;
    const firstRead = readSnapshotHistory(firstResource);
    resource.value = secondResource;
    await readSnapshotHistory(secondResource);
    releaseRead();
    await firstRead;

    expect(versions.value.map(({ summary }) => summary)).toStrictEqual([secondResource.id]);

    resource.value = firstResource;

    expect(versions.value.map(({ summary }) => summary)).toStrictEqual([firstResource.id]);
  });
});
