<script setup lang="ts">
import type { Item } from "#src/models/shared/Item";
import type { SelectItemCategoryDefinition } from "#src/models/shared/SelectItemCategoryDefinition";

import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { NullStrategyItemCategoryDefinitions } from "#src/services/resource/sheet/commands/NullStrategyItemCategoryDefinitions";
import { StringTransformationItemCategoryDefinitions } from "#src/services/resource/sheet/commands/StringTransformationItemCategoryDefinitions";
import { useOutlierStore } from "#src/store/resource/sheet/outlier";
import { useRowStore } from "#src/store/resource/sheet/row";

const outlierStore = useOutlierStore();
const { isOutlierHighlightEnabled } = storeToRefs(outlierStore);
const rowStore = useRowStore();
const { isCopyIncludingHeaders } = storeToRefs(rowStore);
const nullStrategy = useNullStrategy();
const stringTransformation = useStringTransformation();
const isStatisticsOpen = ref(false);
const isDeduplicateOpen = ref(false);
// Each family of cleanup is one flat group, its first option starting it, as a Data menu lists them rather than a
// Submenu each
const getCategoryItems = <TValue>(
  definitions: SelectItemCategoryDefinition<TValue>[],
  prefix: string,
  icon: string,
  apply: (value: TValue) => void,
): Item[] =>
  definitions.map(({ title, value }, index) => ({
    icon,
    isGroupStart: index === 0,
    onClick: () => {
      apply(value);
    },
    title: `${prefix}: ${title}`,
  }));
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
    icon: isCopyIncludingHeaders.value ? "i-mdi:table-headers-eye" : "i-mdi:table-headers-eye-off",
    onClick: () => {
      isCopyIncludingHeaders.value = !isCopyIncludingHeaders.value;
    },
    title: isCopyIncludingHeaders.value ? "Headers included in copy" : "Headers excluded from copy",
  },
  ...getCategoryItems(
    StringTransformationItemCategoryDefinitions,
    "Text",
    "i-mdi:format-letter-case",
    stringTransformation,
  ),
  ...getCategoryItems(NullStrategyItemCategoryDefinitions, "Empty cells", "i-mdi:null", nullStrategy),
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
