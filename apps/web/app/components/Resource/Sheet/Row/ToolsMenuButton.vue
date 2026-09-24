<script setup lang="ts">
import type { Item } from "@/models/shared/Item";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { NullStrategyItemCategoryDefinitions } from "@/services/resource/sheet/commands/NullStrategyItemCategoryDefinitions";
import { StringTransformationItemCategoryDefinitions } from "@/services/resource/sheet/commands/StringTransformationItemCategoryDefinitions";
import { useOutlierStore } from "@/store/resource/sheet/outlier";
import { useRowStore } from "@/store/resource/sheet/row";

const outlierStore = useOutlierStore();
const { isOutlierHighlightEnabled } = storeToRefs(outlierStore);
const rowStore = useRowStore();
const { copyIncludesHeaders } = storeToRefs(rowStore);
const nullStrategy = useNullStrategy();
const stringTransformation = useStringTransformation();
const isStatisticsOpen = ref(false);
const isDeduplicateOpen = ref(false);
// The two families of cleanup are flat groups named by what they do and to what, as a Data menu lists them, rather than
// A submenu each
const items = computed<Item[]>(() => [
  {
    icon: "i-mdi:sigma",
    onClick: () => {
      isStatisticsOpen.value = true;
    },
    title: "Column statistics",
  },
  {
    icon: "i-mdi:table-row-remove",
    onClick: () => {
      isDeduplicateOpen.value = true;
    },
    title: "Remove duplicate rows",
  },
  {
    icon: isOutlierHighlightEnabled.value ? "i-mdi:alert-circle" : "i-mdi:alert-circle-outline",
    onClick: () => {
      isOutlierHighlightEnabled.value = !isOutlierHighlightEnabled.value;
    },
    title: isOutlierHighlightEnabled.value ? "Hide outlier highlighting" : "Show outlier highlighting",
  },
  {
    icon: copyIncludesHeaders.value ? "i-mdi:table-headers-eye" : "i-mdi:table-headers-eye-off",
    onClick: () => {
      copyIncludesHeaders.value = !copyIncludesHeaders.value;
    },
    title: copyIncludesHeaders.value ? "Headers included in copy" : "Headers excluded from copy",
  },
  ...StringTransformationItemCategoryDefinitions.map(({ title, value }, index) => ({
    icon: "i-mdi:format-letter-case",
    isGroupStart: index === 0,
    onClick: () => {
      stringTransformation(value);
    },
    title: `Text: ${title}`,
  })),
  ...NullStrategyItemCategoryDefinitions.map(({ title, value }, index) => ({
    icon: "i-mdi:null",
    isGroupStart: index === 0,
    onClick: () => {
      nullStrategy(value);
    },
    title: `Empty cells: ${title}`,
  })),
]);
</script>

<!-- One menu rather than a row of icons: these are the sheet's data tools, which is how the reference spreadsheets group
  them too — a Data menu you open when you want to clean the sheet, not a permanent rail the reader scans past on the
  way to the table. Add row and Clear filters stay outside it: the first is the primary create action, and the second
  only appears while a filter is on, where it is the state indicator -->
<template>
  <UiOverflowMenu :items label="Data tools" :meaning="UiIconMeaning.Tools" />
  <ResourceSheetColumnStatisticsDialog v-model="isStatisticsOpen" />
  <ResourceSheetRowDeduplicateDialog v-model="isDeduplicateOpen" />
</template>
