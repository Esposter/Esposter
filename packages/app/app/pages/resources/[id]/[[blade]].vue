<script setup lang="ts">
import { ResourceBladeType, ResourceBladeTypes } from "@/models/resource/ResourceBladeType";
import { validate } from "@/services/router/validate";
import { RoutePath } from "@esposter/shared";
// Key by id only so switching blades reuses this page (the left resource list stays mounted instead of refetching);
// The page still remounts when the id changes. validate runs on every navigation, so a bad id/blade 404s at the boundary.
definePageMeta({
  key: (route) => `resource-${Array.isArray(route.params.id) ? route.params.id[0] : route.params.id}`,
  middleware: "auth",
  validate: (route) => {
    if (!validate(route)) return false;
    const { blade } = route.params;
    return !blade || (typeof blade === "string" && ResourceBladeTypes.has(blade as ResourceBladeType));
  },
});
const route = useRoute();
// id is stable for this page instance (keyed by id), so a plain cast is safe; only blade changes without a remount
const id = route.params.id as string;
const { load, publication, publish, remove, rename, resource, unpublish } = useResource(id);
await load();
if (!resource.value) throw createError({ statusCode: 404, statusMessage: "Resource not found" });
const activeBlade = computed(() => (route.params.blade as ResourceBladeType) || ResourceBladeType.Overview);
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
      <ResourceExplorer :active-blade :publication :publish :remove :rename :resource :unpublish />
    </div>
  </NuxtLayout>
</template>
