<script setup lang="ts">
import { ResourceBladeType } from "@/models/resource/ResourceBladeType";
import { checkIsValidResourceBlade } from "@/services/resource/checkIsValidResourceBlade";
import { checkIsUuidRouteId } from "@/services/router/checkIsUuidRouteId";
import { useResourceStore } from "@/store/resource";
import { useFavoriteStore } from "@/store/resource/favorite";
import { getRouteParamString } from "@/util/router/getRouteParamString";

// Key by id only so switching blades reuses this page (the left resource list stays mounted instead of refetching);
// The page still remounts when the id changes. Per-type blade slugs need the loaded resource's type, so the blade
// Itself is 404-guarded after load rather than in validate.
definePageMeta({
  key: (route) => `resource-${getRouteParamString(route.params.id)}`,
  middleware: "auth",
  validate: (route) => checkIsUuidRouteId(route) && (!route.params.blade || typeof route.params.blade === "string"),
});
const { currentRoute } = useRouter();
// Id is stable for this page instance (keyed by id), so a one-time read is safe; only blade changes without a remount
const id = getRouteParamString(currentRoute.value.params.id);
const resourceStore = useResourceStore();
const { resource } = storeToRefs(resourceStore);
const { clearResource, readResource } = resourceStore;
await readResource();
if (!resource.value) throw createError({ statusCode: 404, statusMessage: "Resource not found" });
const activeBlade = computed(() => getRouteParamString(currentRoute.value.params.blade) || ResourceBladeType.Overview);
// Opening a resource is what Recent is a list of — the Recent route, Home's Recent tab and the search
// Dropdown's "Recently opened" group all read the rows this writes
useRecordResourceAccess(resource);
const favoriteStore = useFavoriteStore();
const { readFavorites } = favoriteStore;
// The toolbar's star needs to know whether this resource is already starred
onMounted(async () => {
  await readFavorites();
});
// The store is app-lifetime and this state is the blade's, so the page that opened the resource takes it down
// Again. Keyed by the id it opened, because a page swap mounts the next resource's page first
onUnmounted(() => {
  clearResource(id);
});
// Blade switches reuse this page instance, so the guard watches instead of running once in setup
watchImmediate([activeBlade, resource], ([newActiveBlade, newResource]) => {
  if (newResource && !checkIsValidResourceBlade(newResource.type, newActiveBlade))
    showError(createError({ statusCode: 404, statusMessage: "Resource blade not found" }));
});
</script>

<!-- No title on the layout: the blade toolbar below already names the resource and the blade it is showing, and
     the header repeating the name only pushed the content down a row -->
<template>
  <NuxtLayout name="resource" is-header-bordered>
    <Head>
      <Title>{{ resource?.name ?? "Resource" }}</Title>
    </Head>
    <template v-if="resource">
      <ResourceExplorer :active-blade :resource />
    </template>
  </NuxtLayout>
</template>
