<script setup lang="ts">
import { useItemStore } from "@/store/tableEditor/item";

const emit = defineEmits<{ (event: "delete"): void }>();
const itemStore = useItemStore();
const { editedItem } = storeToRefs(itemStore);
const dialog = ref(false);
const itemNameConfirmation = ref("");
const isDeletable = computed(() => itemNameConfirmation.value === editedItem.value?.name);
</script>

<template>
  <v-dialog v-if="editedItem" v-model="dialog">
    <template #activator>
      <v-tooltip text="Delete">
        <template #activator="{ props: tooltipProps }">
          <v-btn icon="mdi-delete" :="tooltipProps" @click="dialog = true" />
        </template>
      </v-tooltip>
    </template>
    <StyledCard :title="`Confirm Deletion of ${editedItem.type}: '${editedItem.name}'`">
      <v-card-text>
        To confirm the delete action please enter the name of the
        {{ editedItem.type }} exactly as it occurs.
        <v-text-field v-model="itemNameConfirmation" />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="dialog = false">Cancel</v-btn>
        <v-btn
          color="error"
          variant="outlined"
          :disabled="!isDeletable"
          @click="
            () => {
              if (isDeletable) {
                emit('delete');
                itemNameConfirmation = '';
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
