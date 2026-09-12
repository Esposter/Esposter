<script setup lang="ts">
import type { DeleteFormDialogProps } from "@/components/Styled/DeleteFormDialogProps";

import { DELETE_DIALOG_BUTTON_PROPS } from "@/services/styled/constants";

defineSlots<{ default?: () => VNode }>();
const { cardProps } = defineProps<Pick<DeleteFormDialogProps, "cardProps">>();
const emit = defineEmits<{ delete: [onComplete: () => void] }>();
</script>

<template>
  <StyledDeleteFormDialog :card-props @delete="emit('delete', $event)">
    <template #activator="{ updateIsOpen }">
      <StyledTooltipIconButton
        :button-props="DELETE_DIALOG_BUTTON_PROPS"
        icon="mdi-delete"
        :text="cardProps?.title?.toString()"
        @click.stop="updateIsOpen(true)"
      />
    </template>
    <slot />
  </StyledDeleteFormDialog>
</template>
