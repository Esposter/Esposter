<script setup lang="ts">
import { ViewComponentMap } from "@/services/resource/ViewComponentMap";

const route = useRoute();
const type = (Array.isArray(route.params.type) ? route.params.type[0] : route.params.type) ?? "";
const id = (Array.isArray(route.params.id) ? route.params.id[0] : route.params.id) ?? "";
// The route type is an arbitrary string, so it is matched against the registered publishable renderers
const viewComponent = Object.entries(ViewComponentMap).find(([viewType]) => viewType === type)?.[1];
if (!viewComponent) throw createError({ statusCode: 404, statusMessage: "Resource view not found" });
</script>

<template>
  <NuxtLayout>
    <component :is="viewComponent" :id />
  </NuxtLayout>
</template>
