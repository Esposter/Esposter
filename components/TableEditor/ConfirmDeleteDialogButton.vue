<script setup lang="ts">
import { useTableEditorStore } from "@/store/tableEditor";

const tableEditorStore = useTableEditorStore()();
const { save } = tableEditorStore;
const { tableEditor, editedItem, editedIndex } = storeToRefs(tableEditorStore);
// We don't need to show the delete button if user is creating a new item
const isExistingItem = computed(() => editedIndex.value > -1);
const originalItem = computed(() => {
  if (!editedItem.value || !tableEditor.value) return undefined;

  const originalItem = tableEditor.value.items.find((i) => i.id === editedItem.value?.id);
  if (!originalItem) return undefined;

  return originalItem;
});
const displayItemType = computed(() => (originalItem.value ? prettifyName(originalItem.value.type) : ""));
const displayItemName = computed(() => (originalItem.value ? originalItem.value.name : ""));
const dialog = ref(false);
const itemNameTyped = ref("");
const isDeletable = computed(() => itemNameTyped.value === displayItemName.value);
</script>

<template>
  <v-dialog v-if="isExistingItem && editedItem" v-model="dialog">
    <template #activator>
      <v-tooltip text="Delete">
        <template #activator="{ props: tooltipProps }">
          <v-btn icon="mdi-delete" :="tooltipProps" @click="dialog = true" />
        </template>
      </v-tooltip>
    </template>
    <StyledCard>
      <v-card-title whitespace="normal!">
        Confirm Deletion of {{ displayItemType }}: <span font="bold">{{ displayItemName }}</span>
      </v-card-title>
      <v-card-text>
        To confirm the delete action please enter the name of the
        {{ displayItemType }} exactly as it occurs.
        <v-text-field v-model="itemNameTyped" />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="outlined" @click="dialog = false">Cancel</v-btn>
        <v-btn
          color="error"
          variant="outlined"
          :disabled="!isDeletable"
          @click="
            () => {
              save(true);
              dialog = false;
              itemNameTyped = '';
            }
          "
        >
          Delete
        </v-btn>
      </v-card-actions>
    </StyledCard>
  </v-dialog>
</template>
