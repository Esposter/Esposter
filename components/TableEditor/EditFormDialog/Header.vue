<script setup lang="ts">
import ConfirmCloseDialogButton from "@/components/TableEditor/EditFormDialog/ConfirmCloseDialogButton.vue";
import ConfirmDeleteDialogButton from "@/components/TableEditor/EditFormDialog/ConfirmDeleteDialogButton.vue";
import ErrorIcon from "@/components/TableEditor/EditFormDialog/ErrorIcon.vue";
import SaveButton from "@/components/TableEditor/EditFormDialog/SaveButton.vue";
import ToggleFullScreenDialogButton from "@/components/TableEditor/EditFormDialog/ToggleFullScreenDialogButton.vue";
import { useTableEditorStore } from "@/store/tableEditor";
import { prettifyName } from "@/util/text";

const tableEditorStore = useTableEditorStore()();
const { editedItem } = storeToRefs(tableEditorStore);
const displayType = computed(() => (editedItem.value ? prettifyName(editedItem.value.type) : ""));
</script>

<template>
  <v-toolbar flex-none color="surface" :title="`Configuration - ${displayType}`">
    <v-spacer />
    <ErrorIcon />
    <SaveButton />
    <ConfirmDeleteDialogButton />
    <v-divider mx-2="!" thickness="2" inset vertical />
    <ToggleFullScreenDialogButton />
    <ConfirmCloseDialogButton />
  </v-toolbar>
</template>

<style scoped lang="scss">
:deep(.v-toolbar__content) {
  height: auto !important;
  flex-wrap: wrap;
}

:deep(.v-toolbar-title) {
  flex: none;
}

:deep(.v-toolbar-title__placeholder) {
  overflow: initial;
}
</style>
