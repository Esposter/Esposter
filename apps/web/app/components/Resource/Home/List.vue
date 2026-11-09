<script setup lang="ts">
import type { ResourceListItem } from "#shared/models/resource/ResourceListItem";
import type { ResourceListSource } from "@/models/resource/list/ResourceListSource";

import { RECENT_RESOURCES_LIMIT } from "@/services/resource/constants";
import { ResourceListSourceDefinitionMap } from "@/services/resource/list/ResourceListSourceDefinitionMap";

interface Props {
  isPending?: boolean;
  resources: ResourceListItem[];
  source: ResourceListSource;
}

const { isPending, resources, source } = defineProps<Props>();
// An empty Favorites tab is not an empty account, so the copy comes from the set the tab is over
const emptyState = computed(() => ({
  ...ResourceListSourceDefinitionMap[source].emptyState,
  meaning: ResourceListSourceDefinitionMap[source].meaning,
}));
</script>

<!-- The cards fill the width a column at a time, so a wide screen shows every one at a glance rather than a narrow
     column of them -->
<template>
  <UiAsyncBody
    :empty-state
    error=""
    :is-empty="resources.length === 0 ? true : undefined"
    :is-pending="isPending ? true : undefined"
  >
    <template #loading>
      <div class="columns" aria-busy="true" gap-3 grid>
        <!-- Each card's own shape -->
        <UiSkeleton v-for="index of RECENT_RESOURCES_LIMIT" :key="index" h-16 />
      </div>
    </template>
    <ul class="columns" gap-3 grid>
      <li v-for="resource of resources" :key="resource.id">
        <ResourceHomeListItem :resource />
      </li>
    </ul>
  </UiAsyncBody>
</template>

<style scoped>
.columns {
  grid-template-columns: repeat(auto-fill, minmax(min(16rem, 100%), 1fr));
}
</style>
