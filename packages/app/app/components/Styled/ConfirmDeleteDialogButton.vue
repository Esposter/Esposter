<script setup lang="ts">
import type { DeleteFormDialogProps } from "@/components/Styled/DeleteFormDialogProps";
import type { VBtn } from "vuetify/components";

// The same shape every other icon button in a row or a toolbar has, so a delete never reads as a different kind of
// Control beside the copy and edit buttons it sits with
const DELETE_BUTTON_PROPS: VBtn["$props"] = { size: "small" };

defineSlots<{ default?: () => VNode }>();
const { cardProps } = defineProps<Pick<DeleteFormDialogProps, "cardProps">>();
const emit = defineEmits<{ delete: [onComplete: () => void] }>();
</script>

<template>
  <StyledDeleteFormDialog :card-props @delete="emit('delete', $event)">
    <template #activator="{ updateIsOpen }">
      <StyledTooltipIconButton
        :button-props="DELETE_BUTTON_PROPS"
        icon="mdi-delete"
        :text="cardProps?.title?.toString()"
        @click.stop="updateIsOpen(true)"
      />
    </template>
    <slot />
  </StyledDeleteFormDialog>
</template>
