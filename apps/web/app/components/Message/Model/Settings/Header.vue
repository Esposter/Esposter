<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props {
  title: string;
}
// Belongs in the shell's `#header` slot, which renders outside the scroll container — so it stays put without
// `sticky`, and a panel scrolled past it is genuinely out of view rather than hidden underneath it. The Room
// And User dialogs render the same three controls; only what they do on close differs
const { title } = defineProps<Props>();
const emit = defineEmits<{ close: []; "open:drawer": [] }>();
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
    <UiIconButton
      label="Close"
      :meaning="UiIconMeaning.Close"
      :variant="UiButtonVariant.Quiet"
      @click="emit('close')"
    />
  </header>
</template>
