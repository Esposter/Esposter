<script setup lang="ts">
import type { StyledDeleteFormDialogProps } from "@/components/Styled/DeleteFormDialog.vue";

defineSlots<{ default?: () => VNode }>();
const { cardProps, confirmButtonProps } = defineProps<StyledDeleteFormDialogProps>();
const emit = defineEmits<{ delete: [onComplete: () => void] }>();
</script>

<template>
  <StyledDeleteFormDialog :card-props :confirm-button-props @delete="emit('delete', $event)">
    <template #activator="{ updateIsOpen }">
      <StyledTooltipIconButton
        :button-props="{ class: 'm-0', size: 'small', tile: true }"
        icon="mdi-delete"
        :text="cardProps?.title?.toString()"
        @click.stop="updateIsOpen(true)"
      />
    </template>
    <slot />
  </StyledDeleteFormDialog>
</template>
