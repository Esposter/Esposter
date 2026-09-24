<script setup lang="ts">
import type { DialogActivatorSlotProps } from "@/components/Styled/DialogActivatorSlotProps";
import type { Except } from "type-fest";
import type { VBtn, VCard, VDialog } from "vuetify/components";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { getUiButtonProps } from "@/services/styled/getUiButtonProps";
import { mergeProps } from "vue";

// @TODO: https://github.com/vuejs/core/issues/11371
interface Props {
  cardProps?: VCard["$props"];
  confirmButtonAttrs?: VBtn["$attrs"];
  // Absent when the dialog has nothing to confirm — a reference sheet. The whole actions row
  // Goes with it, cancel included: there is no pending change for cancel to abandon, so a dialog that only reads
  // Would otherwise have to re-roll the shell to get rid of one button it never wanted.
  confirmButtonProps?: VBtn["$props"];
  // The two props the shell drives itself are excluded rather than merely bound first: the close button and the
  // Fullscreen toggle write them, so a caller passing either would take over a control it does not own
  dialogProps?: Except<VDialog["$props"], "fullscreen" | "modelValue">;
  // Informational dialogs only acknowledge — cancelling is meaningless when nothing is pending
  hideCancelButton?: boolean;
}

const slots = defineSlots<{
  activator?: (props: DialogActivatorSlotProps) => VNode;
  default?: () => VNode;
  header?: () => VNode;
  "prepend-actions"?: () => VNode;
  "prepend-confirm"?: () => VNode;
}>();
const modelValue = defineModel<boolean>({ default: false });
const {
  cardProps = {},
  confirmButtonAttrs = {},
  confirmButtonProps,
  dialogProps = {},
  hideCancelButton,
} = defineProps<Props>();
const emit = defineEmits<{ confirm: [onComplete: () => void] }>();
const isFullScreen = ref(false);
// Vuetify's block scroll strategy reads the overlay root element a tick after the overlay activates, and an
// Overlay born open has none yet whenever its mount is deferred — a page navigation renders the incoming tree
// Inside a still-pending suspense, so `mounted` has not run and VOverlay renders nothing until it has. The
// Strategy then throws on `undefined.classList` and the whole page render goes with it, so the open state
// Waits for the mount that gives it a root
const isMounted = useMounted();
// A dialog with a pinned header — room and user settings, whose tabs swap panels of other heights — sits high, as the
// Palette does, so the header never moves as its body changes length. Any other is one decision about one thing, and
// Sits in the middle, where Vuetify places it
const isHigh = computed(() => Boolean(slots.header) && !isFullScreen.value);
const hasActions = computed(() => Boolean(confirmButtonProps ?? slots["prepend-actions"] ?? slots["prepend-confirm"]));
const mergedConfirmButtonProps = computed(() => mergeProps(confirmButtonProps ?? {}, confirmButtonAttrs));
// The confirm button is the library's, so the Vuetify props a caller still passes are read into its words
const confirmButton = computed(() => getUiButtonProps(mergedConfirmButtonProps.value, UiButtonVariant.Accent));
const confirm = () => {
  emit("confirm", () => (modelValue.value = false));
};
</script>

<template>
  <!-- Still Vuetify's dialog underneath: a modal in the browser's top layer would hide every Vuetify menu, select and
    Tooltip a dialog's content opens, since those render outside it. The look is the library's -->
  <v-dialog
    class="ui-dialog"
    :class="{ 'items-start': isHigh }"
    :content-class="{ 'mt-[12dvh] max-h-[76dvh]': isHigh }"
    :model-value="modelValue && isMounted"
    transition="ui-dialog-drop"
    :="dialogProps"
    :fullscreen="isFullScreen"
    @update:model-value="modelValue = $event"
  >
    <template #activator>
      <slot name="activator" :is-open="modelValue" :update-is-open="(value) => (modelValue = value)" />
    </template>
    <!-- Single shell for every dialog: a title bar (title, subtitle and mark from cardProps) → optional pinned header
      slot → padded, scrollable body slot → actions. Consumers pass bare body content; the shell owns the layout -->
    <section
      :class="{ 'h-full': isFullScreen }"
      :style="{ maxWidth: cardProps.maxWidth, width: cardProps.width }"
      flex
      flex-col
      max-h-full
      min-h-0
      ui-lifted
    >
      <header px-3 py-2 flex gap-2 ui-bar items-center>
        <v-icon v-if="typeof cardProps.prependIcon === 'string'" :icon="cardProps.prependIcon" />
        <div flex-1 min-w-0>
          <h2 text-accent truncate>{{ cardProps.title }}</h2>
          <p v-if="cardProps.subtitle" text-sm text-muted truncate>{{ cardProps.subtitle }}</p>
        </div>
        <StyledToggleFullScreenDialogButton v-model="isFullScreen" />
        <!-- Every dialog offers exactly one explicit dismissal: Cancel when there is an actions row, this when there is
          Not. Without it a read-only dialog could only be left by clicking outside -->
        <UiIconButton
          v-if="!hasActions"
          label="Close"
          :meaning="UiIconMeaning.Remove"
          :variant="UiButtonVariant.Quiet"
          @click="modelValue = false"
        />
      </header>
      <!-- Pinned above the scroll region — a search field, a filter row. Rendered bare so the consumer owns its own
        Padding: the things that go here are usually full-bleed inputs -->
      <slot name="header" />
      <div v-if="$slots.default" p-3 flex flex-1 flex-col gap-y-4 of-y-auto>
        <slot />
      </div>
      <footer v-if="hasActions" p-3 flex flex-wrap gap-2 items-center>
        <slot name="prepend-actions" />
        <div flex-1 />
        <UiButton v-if="!hideCancelButton" :variant="UiButtonVariant.Quiet" @click="modelValue = false"
          >Cancel</UiButton
        >
        <!-- A third decision — discard, skip, "export anyway" — stays in the trailing group between the two standing
          Answers, so the row reads cancel → alternative → confirm wherever the dialog appears -->
        <slot name="prepend-confirm" />
        <UiButton
          v-if="confirmButtonProps"
          v-bind="confirmButton.attributes"
          :disabled="confirmButton.isDisabled"
          :variant="confirmButton.variant"
          flex
          gap-2
          items-center
          @click="confirm"
        >
          <UiSpinner v-if="confirmButton.isLoading" />
          <span v-else-if="confirmButton.icon" :class="confirmButton.icon" shrink-0 size-5 />
          {{ confirmButton.text }}
        </UiButton>
      </footer>
    </section>
  </v-dialog>
</template>
