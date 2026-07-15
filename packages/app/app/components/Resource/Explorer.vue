<script setup lang="ts">
import type { Resource, ResourcePublication, ResourceTags } from "@esposter/db-schema";

import { RoutePath } from "@esposter/shared";

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
  updateTags: (tags: ResourceTags) => Promise<void>;
}

const {
  activeBlade,
  duplicate,
  isLoading,
  publication,
  publish,
  refresh,
  remove,
  rename,
  resource,
  unpublish,
  updateTags,
} = defineProps<ResourceExplorerProps>();
// On mobile the list box is dropped entirely — the full-width All resources page is the mobile list, reached
// Via the toolbar button — so the blade box gets the whole surface instead of a cramped drawer.
const { smAndDown } = useVDisplay();
</script>

<template>
  <!-- Two flex boxes on one surface: the list box (collapsible, desktop-only) and the blade box -->
  <v-sheet flex flex-1 relative>
    <ResourceExplorerList v-if="!smAndDown" />
    <!-- min-w-0 lets the blade box shrink below its content's intrinsic width so wide blades scroll internally -->
    <div flex flex-1 flex-col min-w-0>
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
          <StyledTooltipIconButton
            icon="mdi-format-list-bulleted"
            text="All resources"
            :button-props="{ to: RoutePath.ResourcesAll }"
          />
        </template>
      </ResourceBladeToolbar>
      <!-- The blade box owns the vertical divider (b-l) that meets the list toolbar's b-b at the corner -->
      <div b-b-0 b-l-1 b-t-1 b-border b-solid flex flex-1 min-w-0 :class="smAndDown ? 'flex-col' : 'flex-row'">
        <ResourceBladeNav :active-blade :resource />
        <div flex-1 min-w-0 overflow-auto>
          <ResourceBladeOutlet :active-blade :is-loading :publication :resource :update-tags />
        </div>
      </div>
    </div>
  </v-sheet>
</template>
