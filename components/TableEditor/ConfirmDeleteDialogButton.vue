<script setup lang="ts">
import { useTableEditorStore } from "@/store/tableEditor";
import { useItemStore } from "@/store/tableEditor/item";

const tableEditorStore = useTableEditorStore();
const { editedItem, editedIndex } = storeToRefs(tableEditorStore);
const isExistingItem = computed(() => editedIndex.value > -1);
const itemStore = useItemStore();
const { deleteItem } = itemStore;
const displayItemType = computed(() => (editedItem.value ? prettifyName(editedItem.value.type) : ""));
const dialog = ref(false);
const itemName = ref("");
const isDeletable = computed(() => itemName.value === editedItem.value?.name);
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
      <v-card-title>Confirm Deletion of {{ displayItemType }}: '{{ editedItem.name }}'</v-card-title>
      <v-card-text>
        To confirm the delete action please enter the name of the
        {{ displayItemType }} exactly as it occurs.
        <v-text-field v-model="itemName" />
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
              if (isDeletable && editedItem) {
                deleteItem(editedItem.id);
                dialog = false;
                itemName = '';
              }
            }
          "
        >
          Delete
        </v-btn>
      </v-card-actions>
    </StyledCard>
  </v-dialog>
</template>
