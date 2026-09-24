<script setup lang="ts">
import { getShortcutKeyLabels } from "@/services/ui/getShortcutKeyLabels";

interface Props {
  // In Vuetify's hotkey syntax: a chord joined by "+", a sequence by "-"
  shortcut: string;
}

const { shortcut } = defineProps<Props>();
</script>

<!-- One raised key cap per key: those held together sit side by side, and each step of a sequence after a gap -->
<template>
  <kbd flex shrink-0 gap-2 items-center>
    <span v-for="(keyLabels, index) of getShortcutKeyLabels(shortcut)" :key="index" flex gap-1>
      <kbd v-for="keyLabel of keyLabels" :key="keyLabel" text-sm px-1 ui-raised>{{ keyLabel }}</kbd>
    </span>
  </kbd>
</template>
