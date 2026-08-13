<script setup lang="ts">
import { DATASET_ROW_CAP_DESCRIPTION } from "#shared/services/dataset/constants";
import { pluralize } from "#shared/util/text/pluralize";
import { formatTruncationCount } from "@/services/dataset/formatTruncationCount";
import { getDatasetTruncation } from "@/services/dataset/getDatasetTruncation";
import { useEmailExportDialogStore } from "@/store/emailEditor/exportDialog";

const exportPersonalizedHtml = useExportPersonalizedHtml();
const emailExportDialogStore = useEmailExportDialogStore();
const { pendingDataset } = storeToRefs(emailExportDialogStore);
// The export command only stages a dataset that truncated, so a staged dataset always has a truncation
const truncation = computed(() => (pendingDataset.value ? getDatasetTruncation(pendingDataset.value) : undefined));
const isOpen = computed({
  get: () => Boolean(truncation.value),
  set: (value) => {
    if (value) return;
    pendingDataset.value = undefined;
  },
});
</script>

<template>
  <StyledDialog
    v-if="pendingDataset && truncation"
    v-model="isOpen"
    :card-props="{ prependIcon: 'mdi-alert-outline', title: 'Export incomplete data?' }"
    :confirm-button-props="{ text: 'Export anyway' }"
    @confirm="
      (onComplete) => {
        exportPersonalizedHtml(pendingDataset?.rows ?? []);
        onComplete();
      }
    "
  >
    <div flex flex-col gap-2>
      <span>
        This email is bound to {{ formatTruncationCount(truncation.totalRows, truncation.isCountCapped) }}
        {{ pluralize("row", truncation.totalRows) }} but only {{ truncation.shownRows }} loaded, so
        <strong>
          {{ formatTruncationCount(truncation.hiddenRows, truncation.isCountCapped) }}
          {{ pluralize("row", truncation.hiddenRows) }} will not get an email
        </strong>
        .
      </span>
      <span op-medium-emphasis>{{ DATASET_ROW_CAP_DESCRIPTION }}</span>
    </div>
  </StyledDialog>
</template>
