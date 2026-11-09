<script setup lang="ts">
import { ViewComponentMap } from "@/services/resource/ViewComponentMap";
import { ResourceType } from "@esposter/db-schema";

const route = useRoute();
const { id, type } = route.params;
// The route type is an arbitrary string, so it is matched against the registered publishable renderers
const viewComponent = Object.entries(ViewComponentMap).find(([viewType]) => viewType === type)?.[1];
if (!viewComponent) throw createError({ status: 404, statusText: "Resource view not found" });
// A srcdoc frame is a whole document of its own, so it fills the viewport beneath the dock; the other renderers are
// Documents that scroll with the page, and keep the page's flow
const isFrame = type === ResourceType.Email || type === ResourceType.Webpage;
// The renderer is what reads the resource, so it names the page after it (useReadPublishedResourceContent)
</script>

<template>
  <NuxtLayout :is-viewport-height="isFrame || undefined">
    <!-- The renderers load on demand, so the boundary is the editor blade's: a skeleton stands in while the chunk
      Arrives on a client-side navigation, rather than the region rendering empty -->
    <Suspense>
      <component :is="viewComponent" :id />
      <template #fallback>
        <UiSkeleton h-dvh />
      </template>
    </Suspense>
  </NuxtLayout>
</template>
