<script setup lang="ts">
import type { Resource, ResourcePublication, ResourceTags } from "@esposter/db-schema";

import { NavigationTrailPage } from "@/models/shared/NavigationTrailPage";
import { useNavigationTrailStore } from "@/store/navigationTrail";

interface ResourceExplorerProps {
  activeBlade: string;
  duplicate: () => Promise<void>;
  isDuplicatePending?: boolean;
  isLoading?: boolean;
  isPublishPending?: boolean;
  isUnpublishPending?: boolean;
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
  isDuplicatePending,
  isLoading,
  isPublishPending,
  isUnpublishPending,
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
// Via the blade's Close button — so the blade box gets the whole surface instead of a cramped drawer.
const { smAndDown } = useVDisplay();
const navigationTrailStore = useNavigationTrailStore();
const { trail } = storeToRefs(navigationTrailStore);
// The two-pane view is what drilling into a list looks like, so it exists only when the visitor actually
// Drilled: a resource opened from a link, a favourite or search has no list behind it to peel back to, and
// Rendering one would invent a context they never had. See /docs/platform/breadcrumb-trail
const isListShown = computed(() => !smAndDown.value && trail.value.at(-1) === NavigationTrailPage.All);
</script>

<template>
  <!-- Two flex boxes on one surface: the list box (collapsible, desktop-only) and the blade box -->
  <v-sheet flex flex-1 relative>
    <ResourceExplorerList v-if="isListShown" />
    <!-- min-w-0 lets the blade box shrink below its content's intrinsic width so wide blades scroll internally.
         The blade box spans the whole shared edge, so it is the one element that draws the vertical divider
         (b-l) meeting the list toolbar's b-b at the corner — only when there is a list box on the other side -->
    <div b-0 b-border b-solid flex flex-1 flex-col min-w-0 :class="{ 'b-l-1': isListShown }">
      <ResourceBladeToolbar
        :active-blade
        :duplicate
        :is-duplicate-pending
        :is-loading
        :is-publish-pending
        :is-unpublish-pending
        :publication
        :publish
        :refresh
        :remove
        :rename
        :resource
        :unpublish
      />
      <div b-0 b-t-1 b-border b-solid flex flex-1 min-w-0 :class="smAndDown ? 'flex-col' : 'flex-row'">
        <ResourceBladeNav :active-blade :resource />
        <div flex-1 min-w-0 overflow-auto>
          <ResourceBladeOutlet :active-blade :is-loading :publication :resource :update-tags />
        </div>
      </div>
    </div>
  </v-sheet>
</template>
