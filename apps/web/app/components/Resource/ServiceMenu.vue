<script setup lang="ts">
import type { UiListItem } from "@/models/ui/UiListItem";

import { LEFT_DRAWER_WIDTH } from "#shared/services/app/constants";
import { ResourceListSources } from "@/models/resource/list/ResourceListSource";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { ResourceListSourceDefinitionMap } from "@/services/resource/list/ResourceListSourceDefinitionMap";
import { RoutePath } from "@esposter/shared";

// Closed until the header's menu button opens it, and closed again by the entry that was picked — navigation is the
// Panel's whole purpose, so staying open outlives its reason to be there
const isOpen = defineModel<boolean>({ required: true });
const { currentRoute } = useRouter();
// Navigation, not state: every entry is a real route, so the set a reader is looking at is deep-linkable,
// Refresh-safe and back-button-safe, and the current entry is decided by the path rather than remembered.
// Matched exactly — Home is a path prefix of every other entry, so a prefix match would leave it lit
// Everywhere. The list routes come from the source registry, so adding a source adds a menu entry
const items = computed<UiListItem<string>[]>(() =>
  [
    { meaning: UiIconMeaning.Home, title: "Home", to: RoutePath.ResourceExplorer },
    ...ResourceListSources.map((source) => ResourceListSourceDefinitionMap[source]),
    { meaning: UiIconMeaning.Tag, title: "Tags", to: RoutePath.ResourceExplorerTags },
    { meaning: UiIconMeaning.Delete, title: "Recycle bin", to: RoutePath.ResourceExplorerRecycleBin },
  ].map(({ meaning, title, to }) => ({ isCurrent: currentRoute.value.path === to, meaning, title, to, value: to })),
);
</script>

<!-- The resource area's own menu, over the content rather than a column beside it: the content is the widest thing on
     the page and these are a handful of links reached a few times a session. Every entry but Home and Tags opens the
     same list surface pointed at a different set, which is what keeps filters, columns, grouping and bulk selection
     built once -->
<template>
  <Transition name="service-menu">
    <nav
      v-if="isOpen"
      :style="{ width: `${LEFT_DRAWER_WIDTH}px` }"
      p-2
      inset-y-0
      left-0
      absolute
      z-2
      of-y-auto
      ui-lifted
    >
      <UiList :items label="Resource menu" @select="isOpen = false" />
    </nav>
  </Transition>
</template>

<style scoped>
.service-menu-enter-active,
.service-menu-leave-active {
  transition:
    opacity var(--ui-motion-medium),
    transform var(--ui-motion-medium);
}

.service-menu-enter-from,
.service-menu-leave-to {
  opacity: 0;
  transform: translateX(calc(var(--ui-step) * -8));
}
</style>
