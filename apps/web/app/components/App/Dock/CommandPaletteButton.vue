<script setup lang="ts">
import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { useCommandStore } from "#src/store/ui/command";

const commandStore = useCommandStore();
const { isCommandPaletteOpen } = storeToRefs(commandStore);
const { openCommandPalette } = commandStore;
</script>

<template>
  <!-- Its tooltip stands down while the palette is open, as a panel trigger's does: shown before the modal, it would
    Stay drawn under the scrim -->
  <UiTooltip #default="{ activatorProps }" :is-disabled="isCommandPaletteOpen" label="Search and commands (Ctrl+K)">
    <UiButton
      :="activatorProps"
      aria-label="Search and commands (Ctrl+K)"
      aria-haspopup="dialog"
      :variant="UiButtonVariant.Quiet"
      px-0
      size-10
      @click="openCommandPalette()"
    >
      <UiIcon :meaning="UiIconMeaning.Command" />
    </UiButton>
  </UiTooltip>
</template>
