<script setup lang="ts">
import type { PaletteGroup } from "@/models/ui/palette/PaletteGroup";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { UiTextFieldType } from "@/models/ui/UiTextFieldType";
import { filterPaletteGroups } from "@/services/ui/palette/filterPaletteGroups";

interface Props {
  groups: PaletteGroup[];
}

const { groups } = defineProps<Props>();
const emit = defineEmits<{ dragStart: [kind: string, event: PointerEvent]; insert: [kind: string] }>();
const query = ref("");
// The titles of the groups a reader folded, so a group is open unless its title is in here
const collapsedTitles = ref<Set<string>>(new Set());
const filteredGroups = computed(() => filterPaletteGroups(groups, query.value));
// A search opens every group it shows, so a header it would hold shut is disabled while the search runs
const isSearching = computed(() => query.value.trim() !== "");
const isGroupOpen = (title: string) => isSearching.value || !collapsedTitles.value.has(title);
const toggleGroup = (title: string) => {
  const nextCollapsedTitles = new Set(collapsedTitles.value);
  if (nextCollapsedTitles.has(title)) nextCollapsedTitles.delete(title);
  else nextCollapsedTitles.add(title);
  collapsedTitles.value = nextCollapsedTitles;
};
// Only the primary button starts a drag, so a secondary press on a tile leaves it to whatever opens on that press
const startDrag = (kind: string, event: PointerEvent) => {
  if (event.button === 0) emit("dragStart", kind, event);
};
</script>

<template>
  <div flex flex-col gap-2>
    <UiTextField v-model="query" label="Search" :type="UiTextFieldType.Search" />
    <p v-if="filteredGroups.length === 0" text-sm text-muted>No match</p>
    <section v-for="{ items, title } of filteredGroups" :key="title" flex flex-col gap-1>
      <button
        :aria-expanded="isGroupOpen(title)"
        :disabled="isSearching"
        class="disabled:cursor-default"
        ui-item
        text-sm
        text-muted
        @click="toggleGroup(title)"
      >
        <UiIcon :meaning="isGroupOpen(title) ? UiIconMeaning.Collapse : UiIconMeaning.Expand" />
        {{ title }}
      </button>
      <div v-if="isGroupOpen(title)" cols="[repeat(auto-fill,minmax(4.25rem,1fr))]" gap-1 grid>
        <UiButton
          v-for="item of items"
          :key="item.kind"
          min-w-0
          w-full
          @click="emit('insert', item.kind)"
          @pointerdown="startDrag(item.kind, $event)"
        >
          <span text-sm text-center flex flex-col gap-1 min-w-0 items-center>
            <UiIcon :meaning="item.icon" />
            <span line-clamp-2 break-words>{{ item.title }}</span>
          </span>
        </UiButton>
      </div>
    </section>
  </div>
</template>
