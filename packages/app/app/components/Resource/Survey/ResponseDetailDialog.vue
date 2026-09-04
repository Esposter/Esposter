<script setup lang="ts">
import type { DatasetColumn } from "#shared/models/dataset/DatasetColumn";
import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";

import { useSurveyResponseDialogStore } from "@/store/resource/surveyResponseDialog";

interface Props {
  columns: DatasetColumn[];
  items: (Record<string, ColumnValue> & { rowKey: string })[];
}

const { columns, items } = defineProps<Props>();
const surveyResponseDialogStore = useSurveyResponseDialogStore();
const { detailRowKey } = storeToRefs(surveyResponseDialogStore);
// One dialog for the whole table, driven by the target row key — never one dialog per row. The item is resolved
// Through the target too, so a response that leaves the page under the open dialog drops it instead of re-opening
// Over that response when a later read brings it back
const { isOpen, item } = useSingletonDialog(detailRowKey, () =>
  items.find(({ rowKey }) => rowKey === detailRowKey.value),
);
</script>

<template>
  <StyledDialog
    v-if="item"
    v-model="isOpen"
    :card-props="{ prependIcon: 'mdi-comment-account-outline', title: 'Response' }"
    :confirm-button-props="{ text: 'Close' }"
    @confirm="(onComplete) => onComplete()"
  >
    <!-- The dataset row rendered vertically — answers already arrive flattened, so there is no new read path -->
    <div gap-x-6 gap-y-3 grid :style="{ gridTemplateColumns: 'auto 1fr' }">
      <template v-for="{ name } of columns" :key="name">
        <span op-medium-emphasis>{{ name }}</span>
        <span v-if="item[name] === null || item[name] === ''" op-medium-emphasis>—</span>
        <span v-else>{{ item[name] }}</span>
      </template>
    </div>
  </StyledDialog>
</template>
