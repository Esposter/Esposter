<script setup lang="ts">
import type { NavigationItem } from "@/models/shared/NavigationItem";
import type { LocalStorageKeyValue } from "@/services/shared/LocalStorageKey";

import { takeOne } from "@esposter/shared";

interface Props {
  // Whole tooltip sentences rather than a noun this interpolates — a component that owns half a sentence
  // Makes every caller guess the other half
  hideText: string;
  items: NavigationItem[];
  showText: string;
  storageKey: LocalStorageKeyValue;
}

const { hideText, items, showText, storageKey } = defineProps<Props>();
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
    <StyledNavigationList :items />
  </v-menu>
  <div v-else-if="isCollapsed" px-1 pt-2>
    <StyledTooltipIconButton icon="mdi-chevron-double-right" :text="showText" @click="isCollapsed = false" />
  </div>
  <div v-else flex flex-col>
    <!-- The caret sits at the end of the rail's own row, the way the portal puts it beside the menu's search -->
    <div px-1 pt-2 flex justify-end>
      <StyledTooltipIconButton icon="mdi-chevron-double-left" :text="hideText" @click="isCollapsed = true" />
    </div>
    <StyledNavigationList :items />
  </div>
</template>
