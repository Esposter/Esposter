<script setup lang="ts">
import { KeyboardShortcutList } from "@/models/message/input/KeyboardShortcutList";
import { useKeyboardShortcutsDialogStore } from "@/store/message/input/keyboardShortcutsDialog";

const keyboardShortcutsDialogStore = useKeyboardShortcutsDialogStore();
const { isOpen } = storeToRefs(keyboardShortcutsDialogStore);
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
        <div v-for="{ category, items } of KeyboardShortcutList" :key="category" mb-4>
          <div text-xs font-bold uppercase op-60 mb-2>{{ category }}</div>
          <div v-for="{ description, keys } of items" :key="description" flex items-center justify-between py-1>
            <span text-sm>{{ description }}</span>
            <div flex items-center gap-1>
              <template v-for="(key, keyIndex) of keys" :key>
                <span v-if="keyIndex > 0" text-xs op-50>+</span>
                <kbd text-xs px-1 py-0 op-70 font-mono>{{ key }}</kbd>
              </template>
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
