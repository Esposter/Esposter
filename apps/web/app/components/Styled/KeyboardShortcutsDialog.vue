<script setup lang="ts">
import type { KeyboardShortcutCategory } from "@/models/shared/KeyboardShortcutCategory";

import { KEYBOARD_SHORTCUTS_CARD_PROPS, KEYBOARD_SHORTCUTS_DIALOG_PROPS } from "@/services/styled/constants";

interface Props {
  list: readonly KeyboardShortcutCategory[];
}

const modelValue = defineModel<boolean>({ default: false });
const { list } = defineProps<Props>();
</script>

<template>
  <!-- Nothing to confirm, so no actions row and no close button of its own — the shell's own chrome closes it -->
  <StyledDialog
    v-model="modelValue"
    :card-props="KEYBOARD_SHORTCUTS_CARD_PROPS"
    :dialog-props="KEYBOARD_SHORTCUTS_DIALOG_PROPS"
  >
    <div v-for="{ category, items } of list" :key="category">
      <div font-bold mb-2 uppercase op-medium-emphasis text-label-medium>{{ category }}</div>
      <div v-for="{ description, keys } of items" :key="description" py-1 flex items-center justify-between>
        <span text-body-medium>{{ description }}</span>
        <div flex gap-1 items-center>
          <template v-for="(key, keyIndex) of keys" :key>
            <span v-if="keyIndex > 0" text-hint>+</span>
            <kbd font-mono px-1 py-0 op-high-emphasis text-body-small>{{ key }}</kbd>
          </template>
        </div>
      </div>
    </div>
  </StyledDialog>
</template>
