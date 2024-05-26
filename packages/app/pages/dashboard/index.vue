<script setup lang="ts">
import { useLayoutStore } from "@/store/dashboard/layout";

defineRouteRules({ ssr: false });
await useReadDashboard();
const layoutStore = useLayoutStore();
const { visuals, noColumns } = storeToRefs(layoutStore);
</script>

<template>
  <NuxtLayout>
    <DashboardGrid :visuals :no-columns />
  </NuxtLayout>
</template>
