<script setup lang="ts">
import { ResourceListSource } from "@/models/resource/list/ResourceListSource";
import { useRecentStore } from "@/store/resource/recent";

const recentStore = useRecentStore();
const { error, isPending, isReadSettled, recents } = storeToRefs(recentStore);
const { readRecents } = recentStore;

onMounted(async () => {
  await readRecents();
});
</script>

<!-- Loading only while there is nothing to show: the rows a read already put in the store stay on screen while the
     next one is out, and an empty set is an answer only once a read has settled -->
<template>
  <UiErrorState v-if="error" :error @retry="readRecents()" />
  <ResourceHomeList
    v-else
    :is-pending="recents.length === 0 && (isPending || !isReadSettled)"
    :resources="recents"
    :source="ResourceListSource.Recents"
  />
</template>
