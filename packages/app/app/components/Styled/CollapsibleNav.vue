<script setup lang="ts">
import type { CollapsibleNavItem } from "@/models/shared/CollapsibleNavItem";

import { takeOne } from "@esposter/shared";

interface StyledCollapsibleNavProps {
  items: CollapsibleNavItem[];
  // Names what the caret hides, in its tooltip: "Hide blade menu", "Hide resource menu"
  label: string;
  storageKey: string;
}

const { items, label, storageKey } = defineProps<StyledCollapsibleNavProps>();
// On mobile the rail collapses into a dropdown so the content keeps the full width.
const { smAndDown } = useVDisplay();
const isOpen = ref(false);
// Collapsing hides the rail outright rather than narrowing it to icons: the content beside it is the widest
// Thing on the page and the nav is a handful of links the caret restores in one click. Persisted, because a
// Reader who reclaimed the width wants it reclaimed on the next page too
const isCollapsed = useLocalStorage(storageKey, false);
const activeItem = computed(() => items.find(({ isActive }) => isActive) ?? takeOne(items));
</script>

<template>
  <v-menu v-if="smAndDown" v-model="isOpen">
    <template #activator="{ props }">
      <v-list nav w-full>
        <v-list-item :="props" :prepend-icon="activeItem.icon" :title="activeItem.title">
          <template #append>
            <v-icon :icon="isOpen ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
          </template>
        </v-list-item>
      </v-list>
    </template>
    <v-list nav>
      <v-list-item
        v-for="item in items"
        :key="item.to"
        :active="item.isActive"
        :prepend-icon="item.icon"
        :title="item.title"
        :to="item.to"
      />
    </v-list>
  </v-menu>
  <div v-else-if="isCollapsed" px-1 pt-2>
    <StyledTooltipIconButton icon="mdi-chevron-double-right" :text="`Show ${label}`" @click="isCollapsed = false" />
  </div>
  <div v-else flex flex-col>
    <!-- The caret sits at the end of the rail's own row, the way the portal puts it beside the menu's search -->
    <div px-1 pt-2 flex justify-end>
      <StyledTooltipIconButton icon="mdi-chevron-double-left" :text="`Hide ${label}`" @click="isCollapsed = true" />
    </div>
    <v-list nav>
      <v-list-item
        v-for="item in items"
        :key="item.to"
        :active="item.isActive"
        :prepend-icon="item.icon"
        :title="item.title"
        :to="item.to"
      />
    </v-list>
  </div>
</template>
