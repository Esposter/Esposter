import type { LinkedResource } from "#shared/models/resource/LinkedResource";
import type { ResourceInResource } from "@esposter/db-schema";

import { EN_US_COMPARATOR } from "#shared/services/intl/constants";
import { READ_RESOURCE_CONSUMERS_IDS_MAX_LENGTH } from "#shared/services/resource/constants";
import { chunk, settleAll } from "@esposter/shared";

// The resources that link to the ids, read a chunk at a time and sorted by name for the list that names them
export const useReadResourceConsumers = (ids: ResourceInResource["id"][]) => {
  const { $trpc } = useNuxtApp();
  const { data } = useQuery(async () => {
    const idSet = new Set(ids);
    const idConsumerMap = new Map<ResourceInResource["id"], LinkedResource>();
    // One chunk at a time, since requests issued in one tick join a single batch and its URL again; the answers fold in
    // Chunk order
    const chunkConsumers = await settleAll(
      chunk(ids, READ_RESOURCE_CONSUMERS_IDS_MAX_LENGTH).map(
        (chunkIds) => () => $trpc.resource.readResourceConsumers.query({ ids: chunkIds }),
      ),
      1,
    );
    for (const consumer of chunkConsumers.flat())
      // A chunk leaves out only its own ids, so one deleted in another chunk is left out here, and one using several
      // Of the ids is named once
      if (!idSet.has(consumer.id)) idConsumerMap.set(consumer.id, consumer);
    return [...idConsumerMap.values()].toSorted((firstConsumer, secondConsumer) =>
      EN_US_COMPARATOR.compare(firstConsumer.name, secondConsumer.name),
    );
  });
  const consumers = computed(() => data.value ?? []);
  return { consumers };
};
