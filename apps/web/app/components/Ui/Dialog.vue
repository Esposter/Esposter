<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { UiDialogPlacementClassMap } from "@/services/ui/UiDialogPlacementClassMap";
import { Dialog } from "@vuetify/v0";

interface Props {
  // A button beside the close one takes it over the whole page and back, for content that wants all the room the
  // Reader can give it
  isExpandable?: true;
  // Drawn in a title bar with a close button beside it, or, where the content says what it is on its own, only the
  // Dialog's accessible name
  isTitleHidden?: true;
  // What kind of thing the title names, drawn small above it: an editor's "Todo" over the todo's name
  overline?: string;
  placement?: UiDialogPlacement;
  title: string;
}
// A modal in the browser's top layer, so everything outside it is inert while it is open. Only for content that is
// The library's alone: a menu, select or tooltip that portals itself to the body would render outside it, underneath
// And inert. What a call site passes goes to the dialog element, which it sizes
defineOptions({ inheritAttrs: false });
// The content's own commands stand in the title bar before the dialog's, as an editor's save and delete do
defineSlots<{ actions?: () => VNode; default: () => VNode }>();
const isOpen = defineModel<boolean>({ default: false });
const isExpanded = defineModel<boolean>("isExpanded", { default: false });
const { isExpandable, isTitleHidden, overline, placement = UiDialogPlacement.High, title } = defineProps<Props>();
const displayPlacement = computed(() => (isExpandable && isExpanded.value ? UiDialogPlacement.FullScreen : placement));
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
      :class="UiDialogPlacementClassMap[displayPlacement]"
      :data-placement="displayPlacement"
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
          displayPlacement === UiDialogPlacement.High || displayPlacement === UiDialogPlacement.Middle
            ? 'max-h-[76dvh]'
            : 'h-full'
        "
        flex
        flex-col
        ui-lifted
      >
        <Dialog.Title v-if="isTitleHidden" sr-only>{{ title }}</Dialog.Title>
        <header v-else px-3 py-2 flex flex-wrap gap-2 ui-bar items-center>
          <hgroup flex-1 min-w-0>
            <p v-if="overline" text-sm text-muted>{{ overline }}</p>
            <Dialog.Title text-heading-color truncate>{{ title }}</Dialog.Title>
          </hgroup>
          <div flex gap-1 items-center>
            <template v-if="$slots.actions">
              <slot name="actions" />
              <!-- The content's own commands, then the dialog's -->
              <div aria-hidden="true" mx-1 bg-border h-6 w="[var(--ui-border-width)]" />
            </template>
            <UiIconButton
              v-if="isExpandable"
              :aria-pressed="isExpanded"
              label="Full screen"
              :meaning="isExpanded ? UiIconMeaning.Collapse : UiIconMeaning.Expand"
              :variant="UiButtonVariant.Quiet"
              @click="isExpanded = !isExpanded"
            />
            <UiIconButton
              label="Close"
              :meaning="UiIconMeaning.Remove"
              :variant="UiButtonVariant.Quiet"
              @click="isOpen = false"
            />
          </div>
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

/* Over the whole page a dialog takes the page's width, whatever width its call site gives it for the other placements.
   It is written here rather than as utilities because a call site's width is a utility too, and only this rule's
   Placement attribute outranks it */
.ui-dialog[data-placement="FullScreen"] {
  max-width: none;
  width: 100%;
}
</style>
