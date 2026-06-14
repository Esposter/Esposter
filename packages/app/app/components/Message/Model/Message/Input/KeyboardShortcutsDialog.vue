<script setup lang="ts">
import { KeyboardShortcutList } from "@/models/message/input/KeyboardShortcutList";
import { useKeyboardShortcutsDialogStore } from "@/store/message/input/keyboardShortcutsDialog";

const keyboardShortcutsDialogStore = useKeyboardShortcutsDialogStore();
const { isOpen } = storeToRefs(keyboardShortcutsDialogStore);
</script>

<template>
  <v-dialog v-model="isOpen" max-width="480">
    <v-card>
      <v-card-title flex gap-2 items-center>
        <v-icon icon="mdi-keyboard" />
        Keyboard Shortcuts
        <v-spacer />
        <v-btn icon="mdi-close" size="small" variant="text" @click="isOpen = false" />
      </v-card-title>
      <v-divider />
      <v-card-text>
        <div v-for="{ category, items } of KeyboardShortcutList" :key="category" mb-4>
          <div font-bold mb-2 uppercase op-medium-emphasis text-label-medium>{{ category }}</div>
          <div v-for="{ description, keys } of items" :key="description" py-1 flex items-center justify-between>
            <span text-body-medium>{{ description }}</span>
            <div flex gap-1 items-center>
              <template v-for="(key, keyIndex) of keys" :key>
                <span v-if="keyIndex > 0" op-medium-emphasis text-body-small>+</span>
                <kbd font-mono px-1 py-0 op-high-emphasis text-body-small>{{ key }}</kbd>
              </template>
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
