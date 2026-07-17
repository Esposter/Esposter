<script setup lang="ts">
import { ResourceBladeType } from "@/models/resource/ResourceBladeType";
import { isValidResourceBlade } from "@/services/resource/isValidResourceBlade";
import { validate } from "@/services/router/validate";
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
// Id is stable for this page instance (keyed by id), so a plain cast is safe; only blade changes without a remount
const id = route.params.id as string;
const { duplicate, isLoading, load, publication, publish, remove, rename, resource, unpublish } = useResource(id);
await load();
if (!resource.value) throw createError({ statusCode: 404, statusMessage: "Resource not found" });
const activeBlade = computed(() => (route.params.blade as string) || ResourceBladeType.Overview);
// Opening a resource feeds the global search dropdown's "Recently viewed" group
useRecordResourceView(resource);

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
      />
    </div>
  </NuxtLayout>
</template>
