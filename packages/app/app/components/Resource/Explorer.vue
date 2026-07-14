<script setup lang="ts">
import type { Resource, ResourcePublication } from "@esposter/db-schema";

interface ResourceExplorerProps {
  activeBlade: string;
  duplicate: () => Promise<void>;
  isLoading?: boolean;
  publication?: ResourcePublication;
  publish: () => Promise<void>;
  refresh: () => Promise<void>;
  remove: () => Promise<boolean>;
  rename: (name: string) => Promise<void>;
  resource: Resource;
  unpublish: () => Promise<void>;
}

const { activeBlade, duplicate, isLoading, publication, publish, refresh, remove, rename, resource, unpublish } =
  defineProps<ResourceExplorerProps>();
// On mobile the list becomes a temporary overlay drawer so the blade box gets the full width.
const { smAndDown } = useVDisplay();
const isListDrawerOpen = ref(false);
const route = useRoute();
// Selecting a resource navigates, so close the mobile drawer whenever the route changes
watch(
  () => route.path,
  () => {
    isListDrawerOpen.value = false;
  },
);
</script>

<template>
  <!-- Two flex boxes on one surface: the list box (collapsible on desktop, drawer on mobile) and the blade box -->
  <v-sheet flex flex-1 relative>
    <ResourceExplorerList v-if="!smAndDown" />
    <div flex flex-1 flex-col>
      <ResourceBladeToolbar
        :active-blade
        :duplicate
        :is-loading
        :publication
        :publish
        :refresh
        :remove
        :rename
        :resource
        :unpublish
      >
        <template v-if="smAndDown" #prepend>
          <StyledTooltipIconButton icon="mdi-menu" text="Show list" @click="isListDrawerOpen = true" />
        </template>
      </ResourceBladeToolbar>
      <!-- The blade box owns the vertical divider (b-l) that meets the list toolbar's b-b at the corner -->
      <div b-b-0 b-l-1 b-t-1 b-border b-solid flex flex-1 :class="smAndDown ? 'flex-col' : 'flex-row'">
        <ResourceBladeNav :active-blade :resource />
        <div flex-1 overflow-y-auto>
          <ResourceBladeOutlet :active-blade :is-loading :publication :resource />
        </div>
      </div>
    </div>
    <v-navigation-drawer v-if="smAndDown" v-model="isListDrawerOpen" temporary absolute>
      <v-toolbar title="Resources" b-b-1 b-border b-solid>
        <template #append>
          <StyledTooltipIconButton icon="mdi-close" text="Close" @click="isListDrawerOpen = false" />
        </template>
      </v-toolbar>
      <ResourceListView :is-searchable="false" />
    </v-navigation-drawer>
  </v-sheet>
</template>
