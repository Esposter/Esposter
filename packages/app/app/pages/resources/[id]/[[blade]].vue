<script setup lang="ts">
import { ResourceBladeType, ResourceBladeTypes } from "@/models/resource/ResourceBladeType";
import { RoutePath } from "@esposter/shared";

definePageMeta({
  key: (route) => `resource-${Array.isArray(route.params.id) ? route.params.id[0] : route.params.id}`,
  middleware: "auth",
});
const { currentRoute } = useRouter();
const id = computed(() =>
  Array.isArray(currentRoute.value.params.id) ? currentRoute.value.params.id[0] : (currentRoute.value.params.id ?? ""),
);
const bladeParam = computed(() =>
  Array.isArray(currentRoute.value.params.blade)
    ? currentRoute.value.params.blade[0]
    : (currentRoute.value.params.blade ?? ""),
);
const { load, publication, publish, remove, rename, resource, unpublish } = useResource(id);
await load();
if (!resource.value) throw createError({ statusCode: 404, statusMessage: "Resource not found" });
watchEffect(() => {
  if (bladeParam.value && !ResourceBladeTypes.has(bladeParam.value as ResourceBladeType))
    showError({ statusCode: 404, statusMessage: "Blade not found" });
});
const activeBlade = computed(() => (bladeParam.value || ResourceBladeType.Overview) as ResourceBladeType);
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
