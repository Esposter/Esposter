<script setup lang="ts">
import type { Resource, ResourcePublication } from "@esposter/db-schema";
import type { ResourceBladeType } from "@/models/resource/ResourceBladeType";

interface ResourceExplorerProps {
  activeBlade: ResourceBladeType;
  publication?: ResourcePublication;
  publish: () => Promise<void>;
  remove: () => Promise<boolean>;
  rename: (name: string) => Promise<void>;
  resource: Resource;
  unpublish: () => Promise<void>;
}

const { activeBlade, publication, publish, remove, rename, resource, unpublish } = defineProps<ResourceExplorerProps>();
</script>

<template>
  <!-- Two flex boxes on one surface: the list box (collapsible) and the blade box -->
  <v-sheet flex flex-1>
    <ResourceExplorerList />
    <div flex flex-1 flex-col>
      <ResourceBladeToolbar :active-blade :publication :publish :remove :rename :resource :unpublish />
      <!-- The blade box owns the vertical divider (b-l) that meets the list toolbar's b-b at the corner -->
      <div b-l-1 b-border b-solid flex flex-1>
        <ResourceBladeNav :active-blade :resource />
        <div flex-1 overflow-y-auto>
          <ResourceBladeOutlet :active-blade :publication :resource />
        </div>
      </div>
    </div>
  </v-sheet>
</template>
