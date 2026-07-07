<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";
import type { ItemSlot } from "vuetify/lib/components/VDataTable/types.mjs";

import { ResourceHeaders } from "@/services/resource/ResourceHeaders";
import { ResourceTypeRoutePathMap } from "@/services/resource/ResourceTypeRoutePathMap";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { ResourceType, ResourceTypes } from "@esposter/db-schema";
import { watchDebounced } from "@vueuse/core";

definePageMeta({ middleware: "auth" });

const { $trpc } = useNuxtApp();
const searchQuery = ref("");
const selectedTypes = ref<ResourceType[]>([]);
const resources = ref<Resource[]>([]);
const readResources = async () => {
  const { items } = await $trpc.resource.readResources.query({
    searchQuery: searchQuery.value || undefined,
    types: selectedTypes.value.length > 0 ? selectedTypes.value : undefined,
  });
  resources.value = items;
};
await readResources();
watchDebounced([searchQuery, selectedTypes], readResources, { debounce: 300, deep: true });
const typeItems = ResourceTypes.map((type) => ({ title: ResourceDefinitionMap[type].title, value: type }));
const getResourceIcon = (type: ResourceType) => ResourceDefinitionMap[type].icon;
const getResourceTitle = (type: ResourceType) => ResourceDefinitionMap[type].title;
const openResource = (resource: Resource) => navigateTo(ResourceTypeRoutePathMap[resource.type](resource.id));
const onClickRow = (_event: MouseEvent, { item }: ItemSlot<Resource>) => openResource(item);
</script>

<template>
  <NuxtLayout>
    <Head>
      <Title>Resource Explorer</Title>
    </Head>
    <StyledPageHeader />
    <v-container fluid>
      <div flex flex-wrap gap-4 mb-4>
        <v-text-field
          v-model="searchQuery"
          clearable
          density="comfortable"
          hide-details
          label="Search resources"
          max-width="24rem"
          min-width="16rem"
          prepend-inner-icon="mdi-magnify"
        />
        <v-select
          v-model="selectedTypes"
          chips
          clearable
          density="comfortable"
          hide-details
          label="Type"
          max-width="20rem"
          min-width="12rem"
          multiple
          :items="typeItems"
        />
      </div>
      <StyledDataTable
        :data-table-props="{
          headers: ResourceHeaders,
          items: resources,
          sortBy: [{ key: 'updatedAt', order: 'desc' }],
        }"
        @click:row="onClickRow"
      >
        <template #[`item.type`]="{ item }">
          <div flex gap-2 items-center>
            <v-icon :icon="getResourceIcon(item.type)" />
            {{ getResourceTitle(item.type) }}
          </div>
        </template>
        <template #[`item.actions`]="{ item }">
          <StyledTooltipIconButton icon="mdi-open-in-new" text="Open" @click.stop="openResource(item)" />
        </template>
        <template #no-data>
          <StyledEmptyState
            icon="mdi-folder-multiple-outline"
            title="No resources yet"
            description="Create a dashboard, table, email, webpage, or flowchart and it will show up here."
          />
        </template>
      </StyledDataTable>
    </v-container>
  </NuxtLayout>
</template>
