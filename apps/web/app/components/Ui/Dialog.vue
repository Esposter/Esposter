<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { Dialog } from "@vuetify/v0";

interface Props {
  // Drawn in a title bar with a close button beside it, or, where the content says what it is on its own, only the
  // Dialog's accessible name
  isTitleHidden?: true;
  title: string;
}

// A modal in the browser's top layer, so everything outside it is inert while it is open. Only for content that is
// The library's alone: a Vuetify menu, select or tooltip inside it would render outside it, underneath and inert. What
// A call site passes goes to the dialog element, which it sizes
defineOptions({ inheritAttrs: false });
defineSlots<{ default: () => VNode }>();
const isOpen = defineModel<boolean>({ default: false });
const { isTitleHidden, title } = defineProps<Props>();
</script>

<template>
  <Dialog.Root v-model="isOpen">
    <!-- High on the screen rather than centred, so a list changing length under a field never moves the field -->
    <Dialog.Content
      v-bind="$attrs"
      class="ui-dialog"
      mt="[12dvh]"
      max-h="[76dvh]"
      text-inherit
      p-0
      b-none
      bg-transparent
      of-visible
    >
      <section max-h="[76dvh]" flex flex-col ui-frame>
        <Dialog.Title v-if="isTitleHidden" sr-only>{{ title }}</Dialog.Title>
        <header v-else class="title-bar" px-3 py-2 flex gap-2 items-center>
          <Dialog.Title text-accent flex-1 truncate>{{ title }}</Dialog.Title>
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
.title-bar {
  box-shadow: inset 0 calc(var(--ui-step) * -1) 0 0 var(--ui-panel-edge);
}
</style>
