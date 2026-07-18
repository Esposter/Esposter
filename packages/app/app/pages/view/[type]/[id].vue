<script setup lang="ts">
import { ViewComponentMap } from "@/services/resource/ViewComponentMap";
import { getRouteParamString } from "@/util/router/getRouteParamString";

const route = useRoute();
const type = getRouteParamString(route.params.type);
const id = getRouteParamString(route.params.id);
// An owner-only preview param — the renderer loads {id}/published/{version} instead of the latest. Anonymous
// visitors have no param and always get the latest; a non-owner passing one is rejected server-side
const versionString = getRouteParamString(route.query.version);
const parsedVersion = Number(versionString);
const version = versionString && Number.isInteger(parsedVersion) && parsedVersion > 0 ? parsedVersion : undefined;
// The route type is an arbitrary string, so it is matched against the registered publishable renderers
const viewComponent = Object.entries(ViewComponentMap).find(([viewType]) => viewType === type)?.[1];
if (!viewComponent) throw createError({ statusCode: 404, statusMessage: "Resource view not found" });
</script>

<template>
  <NuxtLayout>
    <component :is="viewComponent" :id :version />
  </NuxtLayout>
</template>
