<script setup lang="ts">
import { ViewComponentMap } from "@/services/resource/ViewComponentMap";
import { getRouteParamString } from "@/util/router/getRouteParamString";

const { currentRoute } = useRouter();
const type = getRouteParamString(currentRoute.value.params.type);
const id = getRouteParamString(currentRoute.value.params.id);
// An owner-only preview param — the renderer loads {id}/published/{version} instead of the latest. Anonymous
// Visitors have no param and always get the latest; a non-owner passing one is rejected server-side
const versionString = getRouteParamString(currentRoute.value.query.version);
const parsedVersion = Number(versionString);
const version = versionString && Number.isInteger(parsedVersion) && parsedVersion > 0 ? parsedVersion : undefined;
// The route type is an arbitrary string, so it is matched against the registered publishable renderers
const viewComponent = Object.entries(ViewComponentMap).find(([viewType]) => viewType === type)?.[1];
if (!viewComponent) throw createError({ statusCode: 404, statusMessage: "Resource view not found" });
</script>

<template>
  <NuxtLayout>
    <!-- The renderers load on demand, so the boundary is the editor blade's: a skeleton stands in while the chunk
      Arrives on a client-side navigation, rather than the region rendering empty -->
    <Suspense>
      <component :is="viewComponent" :id :version />
      <template #fallback>
        <StyledSkeleton />
      </template>
    </Suspense>
  </NuxtLayout>
</template>
