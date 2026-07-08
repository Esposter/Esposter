<script setup lang="ts">
import { ViewComponentMap } from "@/services/resource/ViewComponentMap";

const route = useRoute();
const type = (Array.isArray(route.params.type) ? route.params.type[0] : route.params.type) ?? "";
const id = (Array.isArray(route.params.id) ? route.params.id[0] : route.params.id) ?? "";
// Publishable types register a renderer here as they migrate off their per-type view pages (roadmap Phase 3/5);
// Until a type lands, its published view stays served by the existing static /view/{type}/[id] page.
const viewComponent = Object.entries(ViewComponentMap).find(([viewType]) => viewType === type)?.[1];
if (!viewComponent) throw createError({ statusCode: 404, statusMessage: "Resource view not found" });
</script>

<template>
  <NuxtLayout>
    <component :is="viewComponent" :id="id" />
  </NuxtLayout>
</template>
