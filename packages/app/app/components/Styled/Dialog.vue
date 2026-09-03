<script setup lang="ts">
import type { Except } from "type-fest";
import type { VBtn, VCard, VDialog } from "vuetify/components";

import { mergeProps } from "vue";

export interface StyledDialogActivatorSlotProps {
  isOpen: boolean;
  updateIsOpen: (value: true) => boolean;
}
// @TODO: https://github.com/vuejs/core/issues/11371
interface StyledDialogProps {
  cardProps?: VCard["$props"];
  confirmButtonAttrs?: VBtn["$attrs"];
  // Absent when the dialog has nothing to confirm — a search palette, a reference sheet. The whole actions row
  // Goes with it, cancel included: there is no pending change for cancel to abandon, so a dialog that only reads
  // Would otherwise have to re-roll the shell to get rid of one button it never wanted.
  confirmButtonProps?: VBtn["$props"];
  // The two props the shell drives itself are excluded rather than merely bound first: the close button and the
  // Fullscreen toggle write them, so a caller passing either would take over a control it does not own
  dialogProps?: Except<VDialog["$props"], "fullscreen" | "modelValue">;
  // Informational dialogs only acknowledge — cancelling is meaningless when nothing is pending
  hideCancelButton?: boolean;
  // A command palette carries no chrome: its own hotkey both opens and dismisses it, and a full-screen search
  // Field is a larger version of nothing. Every other dialog keeps the pair.
  hideToolbarActions?: boolean;
}

const CLOSE_BUTTON_PROPS: VBtn["$props"] = { density: "comfortable", variant: "text" };

const modelValue = defineModel<boolean>({ default: false });
const {
  cardProps = {},
  confirmButtonAttrs = {},
  confirmButtonProps,
  dialogProps = {},
  hideCancelButton,
  hideToolbarActions,
} = defineProps<StyledDialogProps>();
const emit = defineEmits<{ confirm: [onComplete: () => void] }>();
const slots = defineSlots<{
  activator?: (props: StyledDialogActivatorSlotProps) => VNode;
  default?: () => VNode;
  header?: () => VNode;
  "prepend-actions"?: () => VNode;
  "prepend-confirm"?: () => VNode;
}>();
const isFullScreen = ref(false);
// Vuetify's block scroll strategy reads the overlay root element a tick after the overlay activates, and an
// Overlay born open has none yet whenever its mount is deferred — a page navigation renders the incoming tree
// Inside a still-pending suspense, so `mounted` has not run and VOverlay renders nothing until it has. The
// Strategy then throws on `undefined.classList` and the whole page render goes with it, so the open state
// Waits for the mount that gives it a root
const isMounted = useMounted();
const hasActions = computed(() => Boolean(confirmButtonProps ?? slots["prepend-actions"] ?? slots["prepend-confirm"]));
const mergedConfirmButtonProps = computed(() => mergeProps(confirmButtonProps ?? {}, confirmButtonAttrs));
const confirm = () => {
  emit("confirm", () => (modelValue.value = false));
};
</script>

<template>
  <v-dialog
    :model-value="modelValue && isMounted"
    :="dialogProps"
    :fullscreen="isFullScreen"
    @update:model-value="modelValue = $event"
  >
    <template #activator>
      <slot name="activator" :is-open="modelValue" :update-is-open="(value) => (modelValue = value)" />
    </template>
    <!-- Single shell for every dialog: header (title/subtitle/prependIcon via cardProps) → optional pinned
      header slot → divider → padded, scrollable body slot → divider → actions. Consumers pass bare body
      content; the shell owns the layout. -->
    <StyledCard :card-props>
      <!-- Dropped whole rather than emptied: v-card only draws its title row when one of these slots exists, so
        a palette with no chrome starts at its search field instead of under a blank bar. -->
      <template v-if="!hideToolbarActions" #append>
        <StyledToggleFullScreenDialogButton v-model="isFullScreen" />
        <!-- Every dialog that keeps the toolbar offers exactly one explicit dismissal: Cancel when there is an
          actions row, this when there is not. Without it a read-only dialog could only be left by clicking outside it. -->
        <StyledTooltipIconButton
          v-if="!hasActions"
          :button-props="CLOSE_BUTTON_PROPS"
          icon="mdi-close"
          text="Close"
          @click="modelValue = false"
        />
      </template>
      <!-- Pinned above the scroll region — a search field, a filter row. Rendered bare so the consumer owns its
        own padding: the things that go here are usually full-bleed inputs. -->
      <slot name="header" />
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
      <template v-if="hasActions">
        <v-divider />
        <v-card-actions>
          <slot name="prepend-actions" />
          <v-spacer />
          <v-btn v-if="!hideCancelButton" text-3 text="Cancel" variant="outlined" @click="modelValue = false" />
          <!-- A third decision — discard, skip, "export anyway" — stays in the trailing group between the two
            standing answers, so the row reads cancel → alternative → confirm wherever the dialog appears. -->
          <slot name="prepend-confirm" />
          <!-- `primary` is StyledButton's own colour, so it is not a request for a plain button — reading any
            colour as one is what silently dropped the gradient from every dialog that spelled the default out. -->
          <v-btn
            v-if="confirmButtonProps?.color && confirmButtonProps.color !== 'primary'"
            text-3
            variant="outlined"
            :="mergedConfirmButtonProps"
            @click="confirm"
          />
          <StyledButton v-else-if="confirmButtonProps" text-3 :="mergedConfirmButtonProps" @click="confirm" />
        </v-card-actions>
      </template>
    </StyledCard>
  </v-dialog>
</template>
