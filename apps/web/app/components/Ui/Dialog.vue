<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { Dialog } from "@vuetify/v0";

interface Props {
  // Drawn in a title bar with a close button beside it, or, where the content says what it is on its own, only the
  // Dialog's accessible name
  isTitleHidden?: true;
  placement?: UiDialogPlacement;
  title: string;
}
// A modal in the browser's top layer, so everything outside it is inert while it is open. Only for content that is
// The library's alone: a menu, select or tooltip that portals itself to the body would render outside it, underneath
// And inert. What a call site passes goes to the dialog element, which it sizes
defineOptions({ inheritAttrs: false });
defineSlots<{ default: () => VNode }>();
const isOpen = defineModel<boolean>({ default: false });
const { isTitleHidden, placement = UiDialogPlacement.High, title } = defineProps<Props>();
const frame = useTemplateRef("frame");
// Opening moves focus into the dialog, and the browser gives it to the first control when nothing asks for it — the
// Close button. The dialog takes it itself instead, so nothing reads as chosen until the reader moves, and a control
// That asks with autofocus, such as a composer, still gets it
watchImmediate(isOpen, async (newIsOpen) => {
  if (!newIsOpen) return;
  await nextTick();
  const dialog = frame.value?.parentElement;
  if (dialog && !dialog.querySelector("[autofocus]")) dialog.focus();
});
</script>

<template>
  <Dialog.Root v-model="isOpen">
    <!-- A sheet arrives from the edge it stands on: up from the bottom on a narrow screen, in from the right on a wide
      One. Any other drops from above -->
    <!-- Escape asks rather than closes: the browser's own close is held back and the model decides, so a caller that
      Refuses the close — an editor with unsaved changes asking first — keeps the dialog open and in step with it -->
    <!-- Every placement writes its own margins: the reset zeroes the auto margins the browser centres a dialog with -->
    <Dialog.Content
      :="$attrs"
      class="ui-dialog"
      :class="
        placement === UiDialogPlacement.Sheet
          ? 'm-0 h-dvh max-h-dvh max-w-none w-full md:ml-a md:w-1/2 xl:w-2/5 [--ui-dialog-from:translateY(calc(var(--ui-step)*8))] md:[--ui-dialog-from:translateX(calc(var(--ui-step)*8))]'
          : placement === UiDialogPlacement.FullScreen
            ? 'm-0 h-dvh max-h-dvh max-w-none w-full'
            : placement === UiDialogPlacement.High
              ? 'mx-a mb-a mt-[12dvh] max-h-[76dvh]'
              : 'm-a max-h-[76dvh]'
      "
      tabindex="-1"
      text-inherit
      p-0
      b-none
      bg-transparent
      of-visible
      @cancel.prevent
    >
      <section
        ref="frame"
        :class="
          placement === UiDialogPlacement.Sheet || placement === UiDialogPlacement.FullScreen
            ? 'h-full'
            : 'max-h-[76dvh]'
        "
        flex
        flex-col
        ui-lifted
      >
        <Dialog.Title v-if="isTitleHidden" sr-only>{{ title }}</Dialog.Title>
        <header v-else px-3 py-2 flex gap-2 ui-bar items-center>
          <Dialog.Title text-heading-color flex-1 truncate>{{ title }}</Dialog.Title>
          <UiIconButton
            label="Close"
            :meaning="UiIconMeaning.Remove"
            :variant="UiButtonVariant.Quiet"
            @click="isOpen = false"
          />
        </header>
        <slot />
      </section>
    </Dialog.Content>
  </Dialog.Root>
</template>

<style scoped>
/* The dialog holds focus only until the reader moves it, so it draws no ring of its own */
.ui-dialog:focus-visible {
  outline: none;
}
</style>
