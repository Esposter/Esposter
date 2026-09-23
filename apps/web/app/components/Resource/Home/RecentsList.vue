<script setup lang="ts">
import { ResourceListSource } from "@/models/resource/list/ResourceListSource";
import { useRecentStore } from "@/store/resource/recent";

const recentStore = useRecentStore();
const { error, isPending, recents } = storeToRefs(recentStore);
const { readRecents } = recentStore;
const isLoaded = ref(false);

onMounted(async () => {
  await readRecents();
  isLoaded.value = true;
});
</script>

<template>
  <UiErrorState v-if="error" :error @retry="readRecents()" />
  <ResourceHomeList
    v-else
    :is-pending="isPending || !isLoaded"
    :resources="recents"
    :source="ResourceListSource.Recents"
  />
</template>
