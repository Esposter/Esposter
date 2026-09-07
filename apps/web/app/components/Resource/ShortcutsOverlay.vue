<script setup lang="ts">
import { ResourceKeyboardShortcutList } from "@/services/resource/ResourceKeyboardShortcutList";
import { useShortcutsOverlayStore } from "@/store/resource/shortcutsOverlay";

const shortcutsOverlayStore = useShortcutsOverlayStore();
const { isOpen } = storeToRefs(shortcutsOverlayStore);
</script>

<template>
  <StyledKeyboardShortcutsDialog v-model="isOpen" :list="ResourceKeyboardShortcutList" />
</template>
