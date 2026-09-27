<script setup lang="ts" generic="T">
import type { Promisable } from "type-fest";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props<T> {
  itemType: string;
  name: string;
  originalItem?: T;
  // Awaited, so a failed delete keeps the dialog open to try again
  remove?: () => Promisable<unknown>;
}

const { itemType, name, originalItem, remove } = defineProps<Props<T>>();
const isOpen = ref(false);
</script>

<template>
  <template v-if="originalItem && remove">
    <UiIconButton
      label="Delete"
      :meaning="UiIconMeaning.Delete"
      :variant="UiButtonVariant.Quiet"
      @click="isOpen = true"
    />
    <UiConfirmDialog
      v-model="isOpen"
      confirm-label="Delete"
      :confirm-name="name"
      :title="`Confirm Deletion of ${itemType}`"
      :confirm="remove"
    >
      <p>
        To confirm the delete action please enter the name of the
        <strong>{{ itemType }}</strong> exactly as it occurs.
      </p>
    </UiConfirmDialog>
  </template>
</template>
