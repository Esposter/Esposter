<script setup lang="ts">
import type { StyledDeleteFormDialogProps } from "@/components/Styled/DeleteFormDialog.vue";
import type { VBtn } from "vuetify/components";

const DELETE_BUTTON_PROPS: VBtn["$props"] = { class: "m-0", size: "small", tile: true };

defineSlots<{ default?: () => VNode }>();
const { cardProps } = defineProps<Pick<StyledDeleteFormDialogProps, "cardProps">>();
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
