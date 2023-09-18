<script setup lang="ts">
import { useTableEditorStore } from "@/store/tableEditor";
import { prettifyName } from "@/util/text";

const tableEditorStore = useTableEditorStore()();
const { save } = tableEditorStore;
const { editFormDialog, editedItem, isSavable } = storeToRefs(tableEditorStore);
const displayItemType = computed(() => (editedItem.value ? prettifyName(editedItem.value.type) : ""));
const dialog = ref(false);
</script>

<template>
  <v-dialog v-model="dialog">
    <template #activator>
      <v-tooltip text="Close">
        <template #activator="{ props: tooltipProps }">
          <v-btn
            icon="mdi-close"
            :="tooltipProps"
            @click="
              () => {
                if (isSavable) dialog = true;
                else editFormDialog = false;
              }
            "
          />
        </template>
      </v-tooltip>
    </template>
    <StyledCard
      title="Confirm Changes"
      :text="`You have modified this ${displayItemType}. You can save your changes, discard your changes, or cancel to continue
          editing.`"
    >
      <v-card-actions flex="wrap" gap-y="2">
        <v-spacer />
        <v-btn variant="outlined" @click="dialog = false">Cancel</v-btn>
        <v-btn
          variant="outlined"
          @click="
            () => {
              dialog = false;
              editFormDialog = false;
            }
          "
        >
          Discard changes
        </v-btn>
        <v-btn
          variant="outlined"
          @click="
            async () => {
              dialog = false;
              await save();
            }
          "
        >
          Save changes
        </v-btn>
      </v-card-actions>
    </StyledCard>
  </v-dialog>
</template>
