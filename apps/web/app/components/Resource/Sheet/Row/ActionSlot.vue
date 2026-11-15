<script setup lang="ts">
import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";

import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { getDeleteRowDescription } from "#src/services/resource/sheet/commands/getDeleteRowDescription";
import { getEditRowDescription } from "#src/services/resource/sheet/commands/getEditRowDescription";
import { useRowDialogStore } from "#src/store/resource/sheet/rowDialog";

interface Props {
  index: number;
  row: DataSource["rows"][number];
}

defineProps<Props>();
const rowDialogStore = useRowDialogStore();
const { deletingIds, editingId } = storeToRefs(rowDialogStore);
</script>

<template>
  <div flex>
    <UiIconButton
      :label="getEditRowDescription(index)"
      :meaning="UiIconMeaning.Edit"
      :variant="UiButtonVariant.Quiet"
      @click="editingId = row.id"
    />
    <UiIconButton
      :label="getDeleteRowDescription(index)"
      :meaning="UiIconMeaning.Delete"
      :variant="UiButtonVariant.Quiet"
      @click="deletingIds = [row.id]"
    />
  </div>
</template>
