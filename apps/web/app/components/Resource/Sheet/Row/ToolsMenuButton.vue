<script setup lang="ts">
import { NullStrategyItemCategoryDefinitions } from "@/services/resource/sheet/commands/NullStrategyItemCategoryDefinitions";
import { StringTransformationItemCategoryDefinitions } from "@/services/resource/sheet/commands/StringTransformationItemCategoryDefinitions";
import { DENSE_ICON_BUTTON_PROPS } from "@/services/shared/constants";
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
</script>

<template>
  <!-- One menu rather than six icons in a row: these are the sheet's data tools, which is how the reference
    spreadsheets group them too — a Data menu you open when you want to clean the sheet, not a permanent rail
    the reader scans past on the way to the table. Add row and Clear filters stay outside it: the first is the
    primary create action, and the second only appears while a filter is on, where it is the state indicator -->
  <StyledTooltipMenuIconButton :button-props="DENSE_ICON_BUTTON_PROPS" icon="mdi-table-cog" text="Data tools">
    <v-list density="compact">
      <v-list-item prepend-icon="mdi-sigma" title="Column statistics" @click="isStatisticsOpen = true" />
      <v-list-item
        prepend-icon="mdi-table-row-remove"
        title="Remove duplicate rows"
        @click="isDeduplicateOpen = true"
      />
      <v-list-item
        :prepend-icon="isOutlierHighlightEnabled ? 'mdi-alert-circle' : 'mdi-alert-circle-outline'"
        :title="isOutlierHighlightEnabled ? 'Hide outlier highlighting' : 'Show outlier highlighting'"
        @click="isOutlierHighlightEnabled = !isOutlierHighlightEnabled"
      />
      <v-list-item
        :prepend-icon="copyIncludesHeaders ? 'mdi-table-headers-eye' : 'mdi-table-headers-eye-off'"
        :title="copyIncludesHeaders ? 'Headers included in copy' : 'Headers excluded from copy'"
        @click="copyIncludesHeaders = !copyIncludesHeaders"
      />
      <v-divider />
      <!-- Nested one level down rather than each carrying its own menu button, so they read as what they are —
        Two families of the same cleanup, listed the way a Data menu lists them -->
      <v-list-subheader>String transformation</v-list-subheader>
      <v-list-item
        v-for="{ title, value } of StringTransformationItemCategoryDefinitions"
        :key="value"
        :title
        @click="stringTransformation(value)"
      />
      <v-divider />
      <v-list-subheader>Null strategy</v-list-subheader>
      <v-list-item
        v-for="{ title, value } of NullStrategyItemCategoryDefinitions"
        :key="value"
        :title
        @click="nullStrategy(value)"
      />
    </v-list>
  </StyledTooltipMenuIconButton>
  <ResourceSheetColumnStatisticsDialog v-model="isStatisticsOpen" />
  <ResourceSheetRowDeduplicateDialog v-model="isDeduplicateOpen" />
</template>
