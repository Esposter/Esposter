<script setup lang="ts">
import type { VBtn, VCard } from "vuetify/components";

import { mergeProps } from "vue";

export interface StyledDialogActivatorSlotProps {
  isOpen: boolean;
  updateIsOpen: (value: true) => boolean;
}
// @TODO: https://github.com/vuejs/core/issues/11371
interface StyledDialogProps {
  cardProps?: VCard["$props"];
  confirmButtonAttrs?: VBtn["$attrs"];
  confirmButtonProps: VBtn["$props"];
  // Informational dialogs only acknowledge — cancelling is meaningless when nothing is pending
  hideCancelButton?: boolean;
}

defineSlots<{
  activator?: (props: StyledDialogActivatorSlotProps) => VNode;
  default?: () => VNode;
  "prepend-actions"?: () => VNode;
}>();
const modelValue = defineModel<boolean>({ default: false });
const {
  cardProps = {},
  confirmButtonAttrs = {},
  confirmButtonProps,
  hideCancelButton,
} = defineProps<StyledDialogProps>();
const emit = defineEmits<{ confirm: [onComplete: () => void] }>();
const isFullScreen = ref(false);
const mergedConfirmButtonProps = computed(() => mergeProps(confirmButtonProps, confirmButtonAttrs));
const confirm = () => {
  emit("confirm", () => (modelValue.value = false));
};
</script>

<template>
  <v-dialog v-model="modelValue" :fullscreen="isFullScreen">
    <template #activator>
      <slot name="activator" :is-open="modelValue" :update-is-open="(value) => (modelValue = value)" />
    </template>
    <!-- Single shell for every dialog: header (title/subtitle/prependIcon via cardProps) → divider →
      padded, scrollable body slot → divider → actions. Consumers pass bare body content; the shell owns the layout. -->
    <StyledCard :card-props>
      <template #append>
        <StyledToggleFullScreenDialogButton v-model="isFullScreen" />
      </template>
      <template v-if="$slots.default">
        <v-divider />
        <v-card-text flex-1 overflow-y-auto>
          <!-- The shell owns body rhythm, so consumers pass bare children. The wrapper stays auto-height:
            v-card-text is flex-1, so making it the flex container would stretch v-input children to fill it. -->
          <div flex flex-col gap-y-4>
            <slot />
          </div>
        </v-card-text>
      </template>
      <v-divider />
      <v-card-actions>
        <slot name="prepend-actions" />
        <v-spacer />
        <v-btn v-if="!hideCancelButton" text-3 text="Cancel" variant="outlined" @click="modelValue = false" />
        <v-btn
          v-if="confirmButtonProps.color"
          text-3
          variant="outlined"
          :="mergedConfirmButtonProps"
          @click="confirm"
        />
        <StyledButton v-else text-3 :="mergedConfirmButtonProps" @click="confirm" />
      </v-card-actions>
    </StyledCard>
  </v-dialog>
</template>
