<script setup lang="ts">
import type { KeyboardShortcutCategory } from "@/models/shared/KeyboardShortcutCategory";
import type { VBtn } from "vuetify/components";

const CLOSE_BUTTON_PROPS: VBtn["$props"] = { size: "small", variant: "text" };

interface StyledKeyboardShortcutsDialogProps {
  list: readonly KeyboardShortcutCategory[];
}

const modelValue = defineModel<boolean>({ default: false });
const { list } = defineProps<StyledKeyboardShortcutsDialogProps>();
</script>

<template>
  <v-dialog v-model="modelValue" max-width="480">
    <v-card>
      <v-card-title flex gap-2 items-center>
        <v-icon icon="mdi-keyboard" />
        Keyboard Shortcuts
        <v-spacer />
        <StyledTooltipIconButton
          :button-props="CLOSE_BUTTON_PROPS"
          icon="mdi-close"
          text="Close"
          @click="modelValue = false"
        />
      </v-card-title>
      <v-divider />
      <v-card-text>
        <div v-for="{ category, items } of list" :key="category" mb-4>
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
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
