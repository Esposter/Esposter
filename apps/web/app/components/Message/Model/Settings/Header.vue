<script setup lang="ts">
import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";

interface Props {
  title: string;
}
// Belongs in the shell's `#header` slot, which renders outside the scroll container — so it stays put without
// `sticky`, and a panel scrolled past it is genuinely out of view rather than hidden underneath it. The settings dialog
// Hides its own title bar, so this header draws the dialog's commands in its place
defineProps<Props>();
const emit = defineEmits<{ "open:drawer": [] }>();
</script>

<template>
  <header px-4 py-2 flex gap-2 ui-bar items-center>
    <!-- The sidebar folds away on a narrow screen, so its button stands in for it -->
    <UiIconButton
      md:hidden
      label="Show menu"
      :meaning="UiIconMeaning.Menu"
      :variant="UiButtonVariant.Quiet"
      @click="emit('open:drawer')"
    />
    <h2 flex-1 truncate ui-title>{{ title }}</h2>
    <UiDialogCommands />
  </header>
</template>
