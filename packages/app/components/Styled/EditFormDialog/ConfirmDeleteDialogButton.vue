<script setup lang="ts" generic="T extends ItemEntityType<string>">
import type { ItemEntityType } from "@/models/shared/entity/ItemEntityType";
import { prettifyName } from "@/util/text/prettifyName";

interface ConfirmDeleteDialogButtonProps<T> {
  name: string;
  editedItem: T;
  editedIndex: number;
  originalItem: T;
}

const { name, editedItem, editedIndex, originalItem } = defineProps<ConfirmDeleteDialogButtonProps<T>>();
const emit = defineEmits<{ delete: [onComplete: () => void] }>();
// We don't need to show the delete button if user is creating a new item
const isExistingItem = computed(() => editedIndex > -1);
const itemType = computed(() => prettifyName(originalItem.type));
const dialog = ref(false);
const nameTyped = ref("");
const isDeletable = computed(() => nameTyped.value === name);
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
      <v-card-title flex="!" flex-wrap items-center whitespace="normal!">
        Confirm Deletion of {{ itemType }}:
        <v-code mx-2>{{ name }}</v-code>
        <StyledClipboardIconButton :source="name" />
      </v-card-title>
      <v-card-text>
        <div pb-4>
          To confirm the delete action please enter the name of the
          <span font-bold>{{ itemType }}</span> exactly as it occurs.
        </div>
        <v-text-field v-model="nameTyped" />
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
              emit('delete', () => {
                dialog = false;
                nameTyped = '';
              });
            }
          "
        >
          Delete
        </v-btn>
      </v-card-actions>
    </StyledCard>
  </v-dialog>
</template>
