<script setup lang="ts">
import type { Resource, ResourceType } from "@esposter/db-schema";
import type { ItemSlot } from "vuetify/lib/components/VDataTable/types.mjs";

import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { ResourceHeaders } from "@/services/resource/ResourceHeaders";
import { RoutePath } from "@esposter/shared";

interface ResourceListViewProps {
  // When set, a close ✕ routes here (the base list closes back a layer); omitted when it sits behind a blade
  closeTo?: string;
  // The blade list box hides the search toolbar (its own header owns the title + separator)
  searchable?: boolean;
}

const { closeTo, searchable = true } = defineProps<ResourceListViewProps>();
const searchQuery = ref("");
const noTypes = ref<ResourceType[]>([]);
const { count, isLoading, items, readResources } = useReadResources(searchQuery, noTypes);
const search = refDebounced(searchQuery, 300);
const getResourceIcon = (type: ResourceType) => ResourceDefinitionMap[type].icon;
const getResourceTitle = (type: ResourceType) => ResourceDefinitionMap[type].title;
const onClickRow = (_event: MouseEvent, { item }: ItemSlot<Resource>) => navigateTo(RoutePath.Resource(item.id));
</script>

<template>
  <div flex flex-col h-full>
    <v-toolbar v-if="searchable" px-4 py-2 flex flex-wrap gap-2 items-center>
      <v-text-field
        v-model="searchQuery"
        clearable
        density="comfortable"
        hide-details
        label="Search resources"
        max-width="24rem"
        min-width="12rem"
        prepend-inner-icon="mdi-magnify"
      />
      <v-spacer />
      <StyledTooltipIconButton v-if="closeTo" icon="mdi-close" text="Close" :button-props="{ to: closeTo }" />
    </v-toolbar>
    <StyledDataTableServer
      flex
      flex-1
      flex-col
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
        <StyledTooltipIconButton
          icon="mdi-open-in-new"
          text="Open"
          :button-props="{ to: RoutePath.Resource(item.id) }"
        />
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
</template>
