<script setup lang="ts">
import { DATASET_ROW_CAP_DESCRIPTION } from "#shared/services/dataset/constants";
import { pluralize } from "#shared/util/text/pluralize";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";
import { formatTruncationCount } from "@/services/dataset/formatTruncationCount";
import { getDatasetTruncation } from "@/services/dataset/getDatasetTruncation";
import { useEmailExportDialogStore } from "@/store/emailEditor/exportDialog";
import { useResourceStore } from "@/store/resource";

const exportPersonalizedHtml = useExportPersonalizedHtml();
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
</script>

<template>
  <UiDialog
    v-if="pendingDataset && truncation"
    v-model="isOpen"
    :placement="UiDialogPlacement.Middle"
    title="Export incomplete data?"
    w="[min(32rem,90vw)]"
  >
    <div p-3 flex flex-col gap-2>
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
    </div>
    <footer p-3 flex gap-2 justify-end>
      <UiButton :variant="UiButtonVariant.Quiet" @click="isOpen = false">Cancel</UiButton>
      <UiButton
        :variant="UiButtonVariant.Accent"
        @click="
          () => {
            exportPersonalizedHtml(currentResourceId, pendingDataset?.rows ?? []);
            isOpen = false;
          }
        "
      >
        Export anyway
      </UiButton>
    </footer>
  </UiDialog>
</template>
