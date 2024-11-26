<script setup lang="ts" generic="T extends ItemEntityType<string>">
import type { ItemEntityType } from "@/shared/models/entity/ItemEntityType";

import { prettify } from "@/util/text/prettify";

interface ConfirmCloseDialogButtonProps<T> {
  editedItem: T;
  isSavable: boolean;
}

const { editedItem, isSavable } = defineProps<ConfirmCloseDialogButtonProps<T>>();
const emit = defineEmits<{ save: []; "update:edit-form-dialog": [value: false] }>();
const displayItemType = computed(() => prettify(editedItem.type));
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
        <v-btn variant="outlined" @click="dialog = false">Cancel</v-btn>
        <v-btn
          variant="outlined"
          @click="
            () => {
              dialog = false;
              emit('update:edit-form-dialog', false);
            }
          "
        >
          Discard changes
        </v-btn>
        <v-btn
          variant="outlined"
          @click="
            () => {
              dialog = false;
              emit('save');
            }
          "
        >
          Save changes
        </v-btn>
      </v-card-actions>
    </StyledCard>
  </v-dialog>
</template>
