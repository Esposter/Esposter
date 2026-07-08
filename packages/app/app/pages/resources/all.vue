<script setup lang="ts">
import type { Resource, ResourceType } from "@esposter/db-schema";
import type { ItemSlot } from "vuetify/lib/components/VDataTable/types.mjs";

import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { ResourceHeaders } from "@/services/resource/ResourceHeaders";
import { ResourceTypes } from "@esposter/db-schema";
import { RoutePath } from "@esposter/shared";

definePageMeta({ middleware: "auth" });

const route = useRoute();
const searchQuery = ref(typeof route.query.search === "string" ? route.query.search : "");
const selectedTypes = ref<ResourceType[]>([]);
const { count, isLoading, items, readResources } = useReadResources(searchQuery, selectedTypes);
// Encode every filter into the table's search signal so any change resets to page 1 and refetches (debounced)
const search = refDebounced(
  computed(() => JSON.stringify([searchQuery.value, selectedTypes.value])),
  300,
);
const typeItems = ResourceTypes.map((type) => ({ title: ResourceDefinitionMap[type].title, value: type }));
const getResourceIcon = (type: ResourceType) => ResourceDefinitionMap[type].icon;
const getResourceTitle = (type: ResourceType) => ResourceDefinitionMap[type].title;
const openResource = (resource: Resource) => navigateTo(RoutePath.Resource(resource.id));
const onClickRow = (_event: MouseEvent, { item }: ItemSlot<Resource>) => openResource(item);
</script>

<template>
  <NuxtLayout>
    <Head>
      <Title>All Resources</Title>
    </Head>
    <div flex flex-col h-full>
      <StyledPageHeader title="All">
        <template #actions>
          <v-btn color="primary" prepend-icon="mdi-plus" :to="RoutePath.ResourcesCreate">Create a resource</v-btn>
        </template>
        <template #filters>
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
        </template>
      </StyledPageHeader>
      <StyledDataTableServer
        flex
        flex-1
        flex-col
        min-h-0
        :data-table-server-props="{
          headers: ResourceHeaders,
          height: '100%',
          items,
          itemsLength: count,
          loading: isLoading,
          search,
          sortBy: [{ key: 'updatedAt', order: 'desc' }],
        }"
        @click:row="onClickRow"
        @update:options="readResources"
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
            description="Create a resource and it will show up here."
          />
        </template>
      </StyledDataTableServer>
    </div>
  </NuxtLayout>
</template>
