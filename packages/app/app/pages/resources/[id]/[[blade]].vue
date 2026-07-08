<script setup lang="ts">
import { ResourceBladeType, ResourceBladeTypes } from "@/models/resource/ResourceBladeType";
import { RoutePath } from "@esposter/shared";

definePageMeta({ middleware: "auth" });
const route = useRoute();
const id = (Array.isArray(route.params.id) ? route.params.id[0] : route.params.id) ?? "";
const bladeParam = (Array.isArray(route.params.blade) ? route.params.blade[0] : route.params.blade) ?? "";
const { load, publication, publish, remove, rename, resource, unpublish } = useResource(id);
await load();
if (!resource.value) throw createError({ statusCode: 404, statusMessage: "Resource not found" });
if (bladeParam && !ResourceBladeTypes.has(bladeParam as ResourceBladeType))
  throw createError({ statusCode: 404, statusMessage: "Blade not found" });
const activeBlade = (bladeParam || ResourceBladeType.Overview) as ResourceBladeType;
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
