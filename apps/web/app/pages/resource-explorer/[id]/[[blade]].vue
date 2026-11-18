<script setup lang="ts">
import { PageMarkType } from "#shared/models/app/PageMarkType";
import { useReadOpenResource } from "#src/composables/resource/useReadOpenResource";
import { ResourceBladeType } from "#src/models/resource/ResourceBladeType";
import { checkIsUuidRouteId } from "#src/services/router/checkIsUuidRouteId";
import { useFavoriteStore } from "#src/store/resource/favorite";
import { useResourceStore } from "#src/store/resource/index";
import { getRouteParam } from "#src/util/router/getRouteParam";

// Key by id only so switching blades reuses this page (the left resource list stays mounted instead of refetching);
// The page still remounts when the id changes. Per-type blade slugs need the loaded resource's type, so the blade
// Itself is 404-guarded after load rather than in validate.
definePageMeta({
  key: (route) => `resource-${getRouteParam(route.params, "id")}`,
  middleware: "auth",
  validate: checkIsUuidRouteId,
});
const route = useRoute();
// Id is stable for this page instance (keyed by id), so a one-time read is safe; only blade changes without a remount
const { id } = route.params;
const resourceStore = useResourceStore();
const { isReloadPending, resource } = storeToRefs(resourceStore);
const { clearResource, reloadResource } = resourceStore;
// The read is the page's, so its watch ends with the page and keeps the row merged as the topic publishes. Refresh is
// The explicit full reload instead: it takes the current version and lifts the stale latch, as a read always did
const { isPending: isReadPending, readResource } = useReadOpenResource();
const isPending = computed(() => isReadPending.value || isReloadPending.value);
await readResource();
if (!resource.value) throw createError({ status: 404, statusText: "Resource not found" });
const activeBlade = computed(() => route.params.blade || ResourceBladeType.Overview);
// Opening a resource is what Recent is a list of — the Recent route, Home's Recent tab and the palette
// Scope's "Recently opened" group all read the rows this writes
useRecordResourceAccess(resource);
// The dock draws the resource by its type's icon rather than its name's first letter
usePageMark(
  () => resource.value && { id: resource.value.id, resourceType: resource.value.type, type: PageMarkType.Resource },
);
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
useValidateResourceBlade(resource, activeBlade);
</script>

<!-- The resource heads the page itself, its commands beside its name and its blades as tabs under it -->
<template>
  <NuxtLayout name="resource">
    <Head>
      <Title>{{ resource?.name ?? "Resource" }}</Title>
    </Head>
    <template v-if="resource" #heading>
      <ResourceBladeHeader :is-pending :read="reloadResource" :resource />
    </template>
    <template v-if="resource" #navigation>
      <ResourceBladeNavigation :active-blade :resource />
    </template>
    <template v-if="resource">
      <ResourceExplorer :active-blade :is-pending :resource />
    </template>
  </NuxtLayout>
</template>
