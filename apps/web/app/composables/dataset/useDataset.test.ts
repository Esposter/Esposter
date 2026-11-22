// @vitest-environment nuxt
import type { Dataset } from "#shared/models/dataset/Dataset";

import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import { TOPICS_HEADER } from "#shared/services/realtime/constants";
import { formatTopicsHeaderValue } from "#shared/services/realtime/formatTopicsHeaderValue";
import { getLastOpenRealtimeSocketCall } from "#src/services/realtime/openRealtimeSocket.test";
import { getMissingResourceMessage } from "#src/services/resource/getMissingResourceMessage";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useConnectionStore } from "#src/store/realtime/connection";
import { getTopic, TopicKind } from "@esposter/db-schema";
import { waitForSynchronizedFunctions } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { v7 } from "uuid";
import { describe, expect, test, vi } from "vitest";

vi.mock(
  import("#src/services/realtime/openRealtimeSocket"),
  () => import("#src/services/realtime/openRealtimeSocket.test"),
);

describe(useDataset, () => {
  const { trpcMsw } = setupMswTrpc();
  const reference = { id: v7(), type: DatasetProviderType.Sheet };
  const readAt = 0;
  const topic = getTopic(TopicKind.Resource, reference.id);

  // A reference outlives its source in the consumer's content, so the read that finds nothing tells the owner how to
  // Fix the binding rather than echoing the id it could not resolve
  test("reads a missing source as one to rebind or restore", async () => {
    expect.hasAssertions();

    trpcMsw.dataset.readDataset.query(() => {
      throw new TRPCError({ code: "NOT_FOUND", message: " " });
    });
    const { error, refresh } = useDataset(reference);
    await refresh();

    expect(error.value).toBe(getMissingResourceMessage("source"));
  });

  // The dataset on screen is the reference's, so a missing source never sits over the previous source's columns
  test("drops the previous source's dataset when the next one cannot be read", async () => {
    expect.hasAssertions();

    const missingReference = { id: v7(), type: DatasetProviderType.Sheet };
    trpcMsw.dataset.readDataset.query(({ input }) => {
      if (input.id === missingReference.id) throw new TRPCError({ code: "NOT_FOUND", message: " " });
      return { columns: [], rows: [] };
    });
    const currentReference = ref(reference);
    const { dataset, refresh } = useDataset(currentReference);
    await refresh();
    currentReference.value = missingReference;
    await nextTick();
    await refresh();

    expect(dataset.value).toBeUndefined();
  });

  // A source edited elsewhere publishes its topic, which the dataset read names in its answer, so the read runs again
  test("reads the dataset again when a topic its answer names is published", async () => {
    expect.hasAssertions();

    const connectionStore = useConnectionStore();
    const { openUser } = connectionStore;
    openUser();
    const [, onFrame] = getLastOpenRealtimeSocketCall();
    let dataset: Dataset = { columns: [], rows: [] };
    trpcMsw.dataset.readDataset.query(({ ctx }) => {
      ctx.responseHeaders.set(
        TOPICS_HEADER,
        formatTopicsHeaderValue("dataset.readDataset", { readAt, signature: "", topics: [{ topic }] }),
      );
      return dataset;
    });
    const scope = effectScope();
    const reader = scope.run(() => useDataset(reference));
    await reader?.refresh();
    dataset = { columns: [], rows: [{}] };
    onFrame?.(JSON.stringify({ data: { topic }, type: "invalidate" }));
    await waitForSynchronizedFunctions();
    scope.stop();

    expect(reader?.dataset.value).toStrictEqual({ columns: [], rows: [{}] });
  });
});
