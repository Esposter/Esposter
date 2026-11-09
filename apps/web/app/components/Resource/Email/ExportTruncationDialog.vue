<script setup lang="ts">
import { DATASET_ROW_CAP_DESCRIPTION } from "#shared/services/dataset/constants";
import { getDatasetTruncation } from "#shared/services/dataset/getDatasetTruncation";
import { pluralize } from "#shared/util/text/pluralize";
import { formatTruncationCount } from "@/services/dataset/formatTruncationCount";
import { compileStoredEmail } from "@/services/emailEditor/compileStoredEmail";
import { exportPersonalizedRows } from "@/services/emailEditor/exportPersonalizedRows";
import { createErrorAlert } from "@/services/trpc/createErrorAlert";
import { useEmailExportDialogStore } from "@/store/emailEditor/exportDialog";
import { useResourceStore } from "@/store/resource";
import { getResultAsync, noop } from "@esposter/shared";

const emailExportDialogStore = useEmailExportDialogStore();
const { pendingDataset } = storeToRefs(emailExportDialogStore);
const resourceStore = useResourceStore();
const { currentResourceId } = storeToRefs(resourceStore);
// The export command only stages a dataset that truncated, so a staged dataset always has a truncation
const truncation = computed(() => (pendingDataset.value ? getDatasetTruncation(pendingDataset.value) : undefined));
const isOpen = computed({
  get: () => Boolean(truncation.value),
  set: (newIsOpen) => {
    if (newIsOpen) return;
    pendingDataset.value = undefined;
  },
});
// The rows are read before the dialog closes, since closing clears the staged dataset they come from
const exportAnyway = async () => {
  const resourceId = currentResourceId.value;
  const rows = pendingDataset.value?.rows ?? [];
  isOpen.value = false;
  await getResultAsync(async () => {
    const { html } = await compileStoredEmail(resourceId);
    exportPersonalizedRows(resourceId, html, rows);
  }).match(noop, (error) => createErrorAlert(error));
};
</script>

<template>
  <StyledDialog
    v-if="pendingDataset && truncation"
    v-model="isOpen"
    confirm-label="Export anyway"
    :confirm="exportAnyway"
    title="Export incomplete data?"
    w="[min(32rem,90vw)]"
  >
    <span>
      This email is bound to {{ formatTruncationCount(truncation.totalRows, truncation.isCountCapped) }}
      {{ pluralize("row", truncation.totalRows) }} but only {{ truncation.shownRows }} loaded, so
      <strong>
        {{ formatTruncationCount(truncation.hiddenRows, truncation.isCountCapped) }}
        {{ pluralize("row", truncation.hiddenRows) }} will not get an email
      </strong>
      .
    </span>
    <p text-muted>{{ DATASET_ROW_CAP_DESCRIPTION }}</p>
  </StyledDialog>
</template>
