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
  <v-alert v-if="error" ma-4 density="compact" type="error" :text="error">
    <template #append>
      <v-btn size="small" variant="text" @click="readRecents()">Retry</v-btn>
    </template>
  </v-alert>
  <ResourceHomeList
    v-else
    :is-pending="isPending || !isLoaded"
    :resources="recents"
    :source="ResourceListSource.Recents"
  />
</template>
