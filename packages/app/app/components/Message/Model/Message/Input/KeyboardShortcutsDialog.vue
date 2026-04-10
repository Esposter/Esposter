<script setup lang="ts">
import { useKeyboardShortcutsDialogStore } from "@/store/message/input/keyboardShortcutsDialog";

const keyboardShortcutsDialogStore = useKeyboardShortcutsDialogStore();
const { isOpen } = storeToRefs(keyboardShortcutsDialogStore);

const shortcuts = [
  { category: "Navigation", items: [{ description: "Open room search / command palette", keys: ["Ctrl", "K"] }] },
  {
    category: "Messaging",
    items: [
      { description: "Send message", keys: ["Enter"] },
      { description: "New line", keys: ["Shift", "Enter"] },
      { description: "Open slash commands", keys: ["/"] },
      { description: "Mention a user", keys: ["@"] },
    ],
  },
  {
    category: "Editing",
    items: [
      { description: "Save edit", keys: ["Enter"] },
      { description: "Cancel edit", keys: ["Escape"] },
    ],
  },
  {
    category: "General",
    items: [
      { description: "Dismiss / close", keys: ["Escape"] },
      { description: "Open link in new tab", keys: ["Ctrl", "Click"] },
      { description: "Keyboard shortcuts", keys: ["Shift", "?"] },
    ],
  },
] as const;
</script>

<template>
  <v-dialog v-model="isOpen" max-width="480">
    <v-card>
      <v-card-title flex items-center gap-2>
        <v-icon icon="mdi-keyboard" />
        Keyboard Shortcuts
        <v-spacer />
        <v-btn icon="mdi-close" size="small" variant="text" @click="isOpen = false" />
      </v-card-title>
      <v-divider />
      <v-card-text>
        <div v-for="{ category, items } of shortcuts" :key="category" mb-4>
          <div text-xs font-bold uppercase opacity-60 mb-2>{{ category }}</div>
          <div v-for="{ description, keys } of items" :key="description" flex items-center justify-between py-1>
            <span text-sm>{{ description }}</span>
            <div flex items-center gap-1>
              <template v-for="(key, keyIndex) of keys" :key="key">
                <span v-if="keyIndex > 0" text-xs opacity-50>+</span>
                <kbd text-xs px-1 py-0 rounded border border-current opacity-70 font-mono>{{ key }}</kbd>
              </template>
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
