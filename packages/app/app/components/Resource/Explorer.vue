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
</script>

<template>
  <!-- Two flex boxes on one surface: the list box (collapsible) and the blade box -->
  <v-sheet flex flex-1>
    <ResourceExplorerList />
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
      />
      <!-- The blade box owns the vertical divider (b-l) that meets the list toolbar's b-b at the corner -->
      <div b-b-0 b-l-1 b-t-1 b-border b-solid flex flex-1>
        <ResourceBladeNav :active-blade :resource />
        <div flex-1 overflow-y-auto>
          <ResourceBladeOutlet :active-blade :is-loading :publication :resource />
        </div>
      </div>
    </div>
  </v-sheet>
</template>
