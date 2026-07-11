<script setup lang="ts">
import { AppKeyboardShortcutList } from "@/services/app/AppKeyboardShortcutList";
import { useShortcutsOverlayStore } from "@/store/app/shortcutsOverlay";

const shortcutsOverlayStore = useShortcutsOverlayStore();
const { isOpen } = storeToRefs(shortcutsOverlayStore);
</script>

<template>
  <StyledKeyboardShortcutsDialog v-model="isOpen" :list="AppKeyboardShortcutList" />
</template>
