<script setup lang="ts" generic="T extends ItemEntityType<string>">
import type { ItemEntityType } from "@esposter/shared";

import { prettify } from "@/util/text/prettify";

interface ConfirmCloseDialogButtonProps<T> {
  editedItem: T;
  isDirty: boolean;
  isSavable: boolean;
}

const dialog = defineModel<boolean>({ required: true });
const { editedItem, isDirty, isSavable } = defineProps<ConfirmCloseDialogButtonProps<T>>();
const emit = defineEmits<{ save: []; "update:edit-form-dialog": [value: false] }>();
const displayItemType = computed(() => prettify(editedItem.type));
</script>

<template>
  <v-dialog v-model="dialog">
    <template #activator>
      <v-tooltip text="Close">
        <template #activator="{ props }">
          <v-btn
            icon="mdi-close"
            :="props"
            @click="
              () => {
                if (isDirty) dialog = true;
                else emit('update:edit-form-dialog', false);
              }
            "
          />
        </template>
      </v-tooltip>
    </template>
    <StyledCard
      :card-props="{
        title: 'Confirm Changes',
        text: `You have modified this ${displayItemType}. You can save your changes, discard your changes, or cancel to continue
          editing.`,
      }"
    >
      <v-card-actions flex-wrap gap-y-2>
        <v-spacer />
        <v-btn text="Cancel" variant="outlined" @click="dialog = false" />
        <v-btn
          text="Discard changes"
          variant="outlined"
          @click="
            () => {
              dialog = false;
              emit('update:edit-form-dialog', false);
            }
          "
        />
        <StyledButton
          :button-props="{ disabled: !isSavable, text: 'Save changes' }"
          @click="
            () => {
              dialog = false;
              emit('save');
            }
          "
        />
      </v-card-actions>
    </StyledCard>
  </v-dialog>
</template>
