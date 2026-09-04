<script setup lang="ts">
import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";

import { getDeleteRowDescription } from "@/services/resource/sheet/commands/getDeleteRowDescription";
import { getEditRowDescription } from "@/services/resource/sheet/commands/getEditRowDescription";
import { DENSE_ICON_BUTTON_PROPS } from "@/services/shared/constants";
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
    <StyledTooltipIconButton
      :button-props="DENSE_ICON_BUTTON_PROPS"
      icon="mdi-pencil"
      :text="getEditRowDescription(index)"
      @click.stop="editingId = row.id"
    />
    <StyledTooltipIconButton
      :button-props="DENSE_ICON_BUTTON_PROPS"
      icon="mdi-delete"
      :text="getDeleteRowDescription(index)"
      @click.stop="deletingId = row.id"
    />
  </div>
</template>
