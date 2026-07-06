<script setup lang="ts">
import { useVisualStore } from "@/store/dashboard/visual";

defineRouteRules({ ssr: false });

await useReadDashboard();
const visualStore = useVisualStore();
const { visuals } = storeToRefs(visualStore);
</script>

<template>
  <NuxtLayout>
    <Dashboard :visuals />
  </NuxtLayout>
</template>
