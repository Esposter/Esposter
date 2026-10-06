<script setup lang="ts">
import type { ResourceInResource } from "@esposter/db-schema";

import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { pluralize } from "#shared/util/text/pluralize";

interface Props {
  ids: ResourceInResource["id"][];
}

const { ids } = defineProps<Props>();
const { $trpc } = useNuxtApp();
const { data: consumers } = useQuery(() => $trpc.resource.readResourceConsumers.query({ ids }));
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
