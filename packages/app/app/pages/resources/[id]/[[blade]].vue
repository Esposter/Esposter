<script setup lang="ts">
import { ResourceBladeType } from "@/models/resource/ResourceBladeType";
import { isValidResourceBlade } from "@/services/resource/isValidResourceBlade";
import { validate } from "@/services/router/validate";
import { useFavoriteStore } from "@/store/resource/favorite";
import { getRouteParamString } from "@/util/router/getRouteParamString";
import { RoutePath } from "@esposter/shared";

// Key by id only so switching blades reuses this page (the left resource list stays mounted instead of refetching);
// The page still remounts when the id changes. Per-type blade slugs need the loaded resource's type, so the blade
// Itself is 404-guarded after load rather than in validate.
definePageMeta({
  key: (route) => `resource-${getRouteParamString(route.params.id)}`,
  middleware: "auth",
  validate: (route) => validate(route) && (!route.params.blade || typeof route.params.blade === "string"),
});
const route = useRoute();
// Id is stable for this page instance (keyed by id), so a one-time read is safe; only blade changes without a remount
const id = getRouteParamString(route.params.id);
const { duplicate, isLoading, load, publication, publish, remove, rename, resource, unpublish, updateTags } =
  useResource(id);
await load();
if (!resource.value) throw createError({ statusCode: 404, statusMessage: "Resource not found" });
const activeBlade = computed(() => getRouteParamString(route.params.blade) || ResourceBladeType.Overview);
// Opening a resource feeds Home's Recent tab and the search dropdown's "Recently viewed" group
useRecordResourceView(resource);
const favoriteStore = useFavoriteStore();
// The toolbar's star needs to know whether this resource is already starred
onMounted(() => favoriteStore.readFavorites());

// Blade switches reuse this page instance, so the guard watches instead of running once in setup
watchImmediate([activeBlade, resource], ([newActiveBlade, newResource]) => {
  if (newResource && !isValidResourceBlade(newResource.type, newActiveBlade))
    showError(createError({ statusCode: 404, statusMessage: "Resource blade not found" }));
});
</script>

<template>
  <NuxtLayout>
    <Head>
      <Title>{{ resource?.name ?? "Resource" }}</Title>
    </Head>
    <div v-if="resource" flex flex-col h-full>
      <!-- The single unified breadcrumb lives in the base page and updates with the open resource -->
      <StyledPageHeader b-b-1 b-border b-solid>
        <template #breadcrumbs>
          <AppBreadcrumbs :crumbs="[{ title: 'All', to: RoutePath.ResourcesAll }]" :title="resource.name" />
        </template>
      </StyledPageHeader>
      <ResourceExplorer
        :active-blade
        :duplicate
        :is-loading
        :publication
        :publish
        :refresh="load"
        :remove
        :rename
        :resource
        :unpublish
        :update-tags
      />
    </div>
  </NuxtLayout>
</template>
