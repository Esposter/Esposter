<script setup lang="ts">
import { useTableEditorStore } from "@/store/tableEditor";
import { useItemStore } from "@/store/tableEditor/item";

const tableEditorStore = useTableEditorStore();
const { save, resetEditor } = tableEditorStore;
const { editFormDialog } = storeToRefs(tableEditorStore);
const itemStore = useItemStore();
const { editedItem } = storeToRefs(itemStore);
const dialog = ref(false);
</script>

<template>
  <v-dialog v-if="editedItem" v-model="dialog">
    <template #activator>
      <v-tooltip text="Close">
        <template #activator="{ props: tooltipProps }">
          <v-btn icon="mdi-close" :="tooltipProps" @click="editFormDialog = false" />
        </template>
      </v-tooltip>
    </template>
    <StyledCard
      title="Confirm Changes"
      :text="`You have modified this ${editedItem.type}. You can save your changes, discard your changes, or cancel to continue
          editing.`"
    >
      <v-card-actions>
        <v-spacer />
        <v-btn @click="dialog = false">Cancel</v-btn>
        <v-btn
          @click="
            () => {
              resetEditor();
              dialog = false;
            }
          "
        >
          Discard changes
        </v-btn>
        <v-btn
          @click="
            () => {
              save();
              dialog = false;
            }
          "
        >
          Save changes
        </v-btn>
      </v-card-actions>
    </StyledCard>
  </v-dialog>
</template>
