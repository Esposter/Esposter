<script setup lang="ts">
import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { getDeleteRowDescription } from "@/services/resource/sheet/commands/getDeleteRowDescription";
import { getEditRowDescription } from "@/services/resource/sheet/commands/getEditRowDescription";
import { useRowDialogStore } from "@/store/resource/sheet/rowDialog";

interface Props {
  index: number;
  row: DataSource["rows"][number];
}

const { index, row } = defineProps<Props>();
const rowDialogStore = useRowDialogStore();
const { deletingId, editingId } = storeToRefs(rowDialogStore);
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
      @click="deletingId = row.id"
    />
  </div>
</template>
