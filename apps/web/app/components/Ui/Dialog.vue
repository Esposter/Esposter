<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { UiDialogPlacementClassMap } from "@/services/ui/UiDialogPlacementClassMap";
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
    <!-- Escape asks rather than closes: the browser's own close is held back and the model decides, so a caller that
      Refuses the close — an editor with unsaved changes asking first — keeps the dialog open and in step with it -->
    <Dialog.Content
      :="$attrs"
      class="ui-dialog"
      :class="UiDialogPlacementClassMap[placement]"
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
          placement === UiDialogPlacement.High || placement === UiDialogPlacement.Middle ? 'max-h-[76dvh]' : 'h-full'
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
