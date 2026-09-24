<script setup lang="ts" generic="T extends ItemEntityType<string>">
import type { ItemEntityType } from "@esposter/shared";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props<T> {
  name: string;
  originalItem?: T;
}

const { name, originalItem } = defineProps<Props<T>>();
const emit = defineEmits<{ delete: [onComplete: (isSuccessful?: boolean) => void] }>();
const cardProps = computed(() => ({ title: `Confirm Deletion of ${originalItem?.type}` }));
</script>

<template>
  <StyledDeleteFormDialog v-if="originalItem" :card-props :confirm-name="name" @delete="emit('delete', $event)">
    <template #activator="{ updateIsOpen }">
      <UiIconButton
        label="Delete"
        :meaning="UiIconMeaning.Delete"
        :variant="UiButtonVariant.Quiet"
        @click="updateIsOpen(true)"
      />
    </template>
    <p>
      To confirm the delete action please enter the name of the
      <strong>{{ originalItem.type }}</strong> exactly as it occurs.
    </p>
  </StyledDeleteFormDialog>
</template>
