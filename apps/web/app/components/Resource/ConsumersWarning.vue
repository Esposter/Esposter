<script setup lang="ts">
import type { LinkedResource } from "#shared/models/resource/LinkedResource";
import type { ResourceInResource } from "@esposter/db-schema";

import { EN_US_COMPARATOR } from "#shared/services/intl/constants";
import { READ_RESOURCE_CONSUMERS_IDS_MAX_LENGTH } from "#shared/services/resource/constants";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { pluralize } from "#shared/util/text/pluralize";
import { chunk } from "@esposter/shared";

interface Props {
  ids: ResourceInResource["id"][];
}

const { ids } = defineProps<Props>();
const { $trpc } = useNuxtApp();
const { data: consumers } = useQuery(async () => {
  const idSet = new Set(ids);
  const idConsumerMap = new Map<ResourceInResource["id"], LinkedResource>();
  for (const chunkIds of chunk(ids, READ_RESOURCE_CONSUMERS_IDS_MAX_LENGTH))
    // oxlint-disable-next-line no-await-in-loop -- A chunk read in the same tick would join one batch, and one URL
    for (const consumer of await $trpc.resource.readResourceConsumers.query({ ids: chunkIds }))
      // A chunk leaves out only its own ids, so one deleted in another chunk is left out here, and one using several
      // Of the ids is named once
      if (!idSet.has(consumer.id)) idConsumerMap.set(consumer.id, consumer);
  return [...idConsumerMap.values()].toSorted((firstConsumer, secondConsumer) =>
    EN_US_COMPARATOR.compare(firstConsumer.name, secondConsumer.name),
  );
});
</script>

<!-- What a delete leaves dangling, said before it happens, as Airtable lists what depends on a field before it goes.
  Nothing is said until the read lands, and nothing at all when no other resource uses what is being deleted -->
<template>
  <UiAlert v-if="consumers?.length" status="warning">
    <p>
      Used by {{ consumers.length }} other {{ pluralize("resource", consumers.length) }}, which will show
      {{ ids.length === 1 ? "it" : "them" }} as missing until restored:
    </p>
    <ul mt-1 flex flex-col>
      <li v-for="{ id, name, type } of consumers" :key="id" ui-row>
        <UiItemContent
          :description="ResourceDefinitionMap[type].title"
          :icon="ResourceDefinitionMap[type].icon"
          :title="name"
        />
      </li>
    </ul>
  </UiAlert>
</template>
