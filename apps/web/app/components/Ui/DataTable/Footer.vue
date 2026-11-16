<script setup lang="ts">
import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { UiDataTableDensity } from "#src/models/ui/UiDataTableDensity";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";

interface Props {
  // The page sizes the reader picks from, -1 for every row
  itemsPerPageOptions: number[];
  // How many pages the rows make at the page size, which the next page stops at
  pageCount: number;
  // How many rows there are across every page, which the range reads out of
  totalLength: number;
}
// The footer of a table that pages its rows: the page size and density the reader picks, the range the page shows and
// The steps to the previous and next page
const density = defineModel<UiDataTableDensity>("density", { required: true });
const itemsPerPage = defineModel<number>("itemsPerPage", { required: true });
const page = defineModel<number>("page", { required: true });
const { itemsPerPageOptions, totalLength } = defineProps<Props>();
const rangeText = computed(() => {
  if (totalLength === 0) return "0 of 0";
  else if (itemsPerPage.value === -1) return `1–${totalLength} of ${totalLength}`;
  const start = (page.value - 1) * itemsPerPage.value + 1;
  const stop = Math.min(page.value * itemsPerPage.value, totalLength);
  return `${start}–${stop} of ${totalLength}`;
});
const itemsPerPageItems = computed(() =>
  itemsPerPageOptions.map((option) => ({
    meaning: UiIconMeaning.Rows,
    title: option === -1 ? "All" : String(option),
    value: String(option),
  })),
);
const itemsPerPageValue = computed({
  get: () => String(itemsPerPage.value),
  set: (value) => {
    itemsPerPage.value = Number(value);
    page.value = 1;
  },
});
</script>

<template>
  <footer px-3 py-1 flex gap-3 ui-bar items-center justify-end>
    <div w-24>
      <UiSelect v-model="itemsPerPageValue" :items="itemsPerPageItems" label="Rows per page" />
    </div>
    <UiIconButton
      :aria-pressed="density === UiDataTableDensity.Compact"
      label="Compact rows"
      :meaning="UiIconMeaning.Collapse"
      :variant="UiButtonVariant.Quiet"
      @click="
        density = density === UiDataTableDensity.Compact ? UiDataTableDensity.Comfortable : UiDataTableDensity.Compact
      "
    />
    <span text-muted text-nowrap>{{ rangeText }}</span>
    <UiIconButton
      :disabled="page <= 1"
      label="Previous page"
      :meaning="UiIconMeaning.Previous"
      :variant="UiButtonVariant.Quiet"
      @click="page -= 1"
    />
    <UiIconButton
      :disabled="page >= pageCount"
      label="Next page"
      :meaning="UiIconMeaning.Next"
      :variant="UiButtonVariant.Quiet"
      @click="page += 1"
    />
  </footer>
</template>
