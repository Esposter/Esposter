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
</script>

<!-- The cards fill the width a column at a time, so a wide screen shows every one at a glance rather than a narrow
     column of them -->
<template>
  <div v-if="isPending" class="columns" aria-busy="true" gap-3 grid>
    <!-- Each card's own shape -->
    <UiSkeleton v-for="index of RECENT_RESOURCES_LIMIT" :key="index" h-16 />
  </div>
  <!-- An empty Favorites tab is not an empty account, so the copy comes from the set the tab is over -->
  <UiEmptyState
    v-else-if="resources.length === 0"
    :="ResourceListSourceDefinitionMap[source].emptyState"
    :meaning="ResourceListSourceDefinitionMap[source].meaning"
  />
  <ul v-else class="columns" gap-3 grid>
    <li v-for="resource of resources" :key="resource.id">
      <ResourceHomeListItem :resource />
    </li>
  </ul>
</template>

<style scoped>
.columns {
  grid-template-columns: repeat(auto-fill, minmax(min(16rem, 100%), 1fr));
}
</style>
