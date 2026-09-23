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

<!-- The rows fill the width a slot at a time, as an inventory does, so a wide screen shows every one at a glance
     rather than a narrow column of them -->
<template>
  <div v-if="isPending" class="slots" aria-busy="true" gap-2 grid>
    <!-- Each row's own shape: the type's block beside a name and its caption -->
    <div v-for="index of RECENT_RESOURCES_LIMIT" :key="index" p-2 flex gap-3 items-center>
      <UiSkeleton shrink-0 size-10 />
      <div flex flex-1 flex-col gap-2>
        <UiSkeleton h-4 w="2/3" />
        <UiSkeleton h-3 w="1/2" />
      </div>
    </div>
  </div>
  <!-- An empty Favorites tab is not an empty account, so the copy comes from the set the tab is over -->
  <UiEmptyState
    v-else-if="resources.length === 0"
    :="ResourceListSourceDefinitionMap[source].emptyState"
    :meaning="ResourceListSourceDefinitionMap[source].meaning"
  />
  <ul v-else class="slots" gap-2 grid>
    <li v-for="resource of resources" :key="resource.id">
      <ResourceHomeListItem :resource />
    </li>
  </ul>
</template>

<style scoped>
.slots {
  grid-template-columns: repeat(auto-fill, minmax(min(16rem, 100%), 1fr));
}
</style>
