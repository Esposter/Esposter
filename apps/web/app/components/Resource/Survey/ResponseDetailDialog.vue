<script setup lang="ts">
import type { DatasetColumn } from "#shared/models/dataset/DatasetColumn";
import type { SurveyResponseRecord } from "#shared/models/resource/survey/SurveyResponseRecord";

import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";
import { useSurveyResponseDialogStore } from "@/store/resource/surveyResponseDialog";

interface Props {
  columns: DatasetColumn[];
  items: SurveyResponseRecord[];
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
  <UiDialog v-if="item" v-model="isOpen" :placement="UiDialogPlacement.Middle" title="Response" w="[min(40rem,90vw)]">
    <!-- The dataset row rendered vertically — answers already arrive flattened, so there is no new read path -->
    <dl p-3 gap-x-6 gap-y-3 grid grid-cols="[auto_1fr]" of-y-auto>
      <template v-for="{ name } of columns" :key="name">
        <dt text-muted>{{ name }}</dt>
        <dd v-if="item[name] === null || item[name] === ''" text-muted>—</dd>
        <dd v-else>{{ item[name] }}</dd>
      </template>
    </dl>
  </UiDialog>
</template>
