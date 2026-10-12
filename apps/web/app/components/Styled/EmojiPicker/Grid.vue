<script setup lang="ts">
import type { PickableEmoji } from "@/models/message/emoji/PickableEmoji";
import type { SkinTone } from "@/models/message/emoji/SkinTone";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { EMOJI_GRID_COLUMN_COUNT } from "@/services/message/emoji/constants";
import { chunk } from "@esposter/shared";

interface Props {
  emojis: PickableEmoji[];
  skinTone: SkinTone;
}

const { emojis, skinTone } = defineProps<Props>();
// Hover is reported with no emoji when the pointer leaves an emoji, because whatever is showing the preview has
// Standing content of its own to put back — a preview that outlived the pointer would hold that space for good.
// Crossing from one emoji to the next reports the leave before the enter, which Vue renders as one update
defineEmits<{ hover: [emoji?: PickableEmoji]; select: [emoji: PickableEmoji] }>();
const grid = useTemplateRef("grid");
// The emoji holding the one tab stop, by its place in the grid. A new list starts its tab stop at its first emoji, so a
// Search does not carry the stop over to whatever happens to sit at the same place in the results
const tabStopIndex = ref(0);
watch(
  () => emojis,
  () => {
    tabStopIndex.value = 0;
  },
);
const rows = computed(() =>
  chunk(
    emojis.map((emoji, index) => ({ emoji, index })),
    EMOJI_GRID_COLUMN_COUNT,
  ),
);
// The arrows walk a cell, or a row up and down, and Home and End go to a row's ends. Enter picks through the
// Focused button's own keydown, so this map leaves it alone
const getNextIndex = (event: KeyboardEvent, index: number) => {
  const lastIndex = emojis.length - 1;
  const rowStartIndex = Math.floor(index / EMOJI_GRID_COLUMN_COUNT) * EMOJI_GRID_COLUMN_COUNT;

  switch (event.key) {
    // A row below that lacks this column stops at the last emoji, and no row below leaves the focus where it is
    case "ArrowDown":
      return rowStartIndex + EMOJI_GRID_COLUMN_COUNT <= lastIndex
        ? Math.min(index + EMOJI_GRID_COLUMN_COUNT, lastIndex)
        : undefined;
    case "ArrowLeft":
      return index > 0 ? index - 1 : undefined;
    case "ArrowRight":
      return index < lastIndex ? index + 1 : undefined;
    case "ArrowUp":
      return rowStartIndex > 0 ? index - EMOJI_GRID_COLUMN_COUNT : undefined;
    case "End":
      return Math.min(rowStartIndex + EMOJI_GRID_COLUMN_COUNT - 1, lastIndex);
    case "Home":
      return rowStartIndex;
    default:
      return undefined;
  }
};
const onGridKeydown = useGridKeyboard({
  getCellSelector: (index) => `button[data-index="${index}"]`,
  getFocusedCell: () => (emojis.length > 0 ? tabStopIndex.value : undefined),
  getNextCell: getNextIndex,
  root: grid,
  setFocusedCell: (index) => {
    tabStopIndex.value = index;
  },
});
</script>

<template>
  <!-- One category at a time, so the largest list is under four hundred buttons and needs no virtualisation. Each is
    The library's quiet button drawn by its rule rather than its component, which would mount a primitive per cell.
    The grid has one tab stop and its arrows walk it, the rows and cells being roles alone so the columns lay out flat -->
  <div
    ref="grid"
    aria-label="Emojis"
    role="grid"
    tabindex="-1"
    flex-1
    gap-0.5
    grid
    min-h-0
    content-start
    of-y-auto
    :style="{ gridTemplateColumns: `repeat(${EMOJI_GRID_COLUMN_COUNT}, minmax(0, 1fr))` }"
    @keydown="onGridKeydown($event)"
  >
    <div v-for="(row, rowIndex) of rows" :key="rowIndex" role="row" contents>
      <div v-for="{ emoji, index } of row" :key="emoji.slug" role="gridcell" contents>
        <button
          :aria-label="emoji.name"
          :data-index="index"
          :data-variant="UiButtonVariant.Quiet"
          :tabindex="index === tabStopIndex ? 0 : -1"
          type="button"
          ui-button
          px-0
          aspect-square
          ui-title
          @blur="$emit('hover')"
          @click="$emit('select', emoji)"
          @focus="$emit('hover', emoji)"
          @keydown.enter.prevent="$emit('select', emoji)"
          @mouseenter="$emit('hover', emoji)"
          @mouseleave="$emit('hover')"
        >
          <StyledEmoji :emoji :skin-tone />
        </button>
      </div>
    </div>
  </div>
</template>
