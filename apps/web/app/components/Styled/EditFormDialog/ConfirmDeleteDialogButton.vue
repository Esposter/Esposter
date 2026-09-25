<script setup lang="ts" generic="T extends ItemEntityType<string>">
import type { ItemEntityType } from "@esposter/shared";
import type { Promisable } from "type-fest";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props<T> {
  name: string;
  originalItem?: T;
  // Awaited, so a failed delete keeps the dialog open to try again
  remove?: () => Promisable<unknown>;
}

const { name, originalItem, remove } = defineProps<Props<T>>();
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
      :title="`Confirm Deletion of ${originalItem.type}`"
      :confirm="remove"
    >
      <p>
        To confirm the delete action please enter the name of the
        <strong>{{ originalItem.type }}</strong> exactly as it occurs.
      </p>
    </UiConfirmDialog>
  </template>
</template>
