<script setup lang="ts">
import { KeyboardShortcutList } from "@/models/message/input/KeyboardShortcutList";
import { useKeyboardShortcutsDialogStore } from "@/store/message/input/keyboardShortcutsDialog";

const keyboardShortcutsDialogStore = useKeyboardShortcutsDialogStore();
const { isOpen } = storeToRefs(keyboardShortcutsDialogStore);
</script>

<template>
  <StyledKeyboardShortcutsDialog v-model="isOpen" :list="KeyboardShortcutList" />
</template>
