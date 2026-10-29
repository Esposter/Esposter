<script setup lang="ts">
import type { DevConsoleEntry } from "@/models/genshin/dev/DevConsoleEntry";
import type { DevRegistry } from "genshin-world";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { GENSHIN_DEV_COMMAND_GROUP, GENSHIN_DEV_CONSOLE_HISTORY_LENGTH } from "@/services/genshin/dev/constants";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";

interface Props {
  registry: DevRegistry;
}

// The development console: one field docked at the bottom, its results above it. The field's keys are the console's
// Alone while it is focused: the engine ignores a key typed into a field, and the event stops here so the screens'
// Own listeners on the window never see it. The keys it handles itself are listed while it is open, and never bound
const isOpen = defineModel<boolean>({ required: true });
const { registry } = defineProps<Props>();
const line = ref("");
const entries = useLocalStorage<DevConsoleEntry[]>(LocalStorageKey.GenshinDevConsoleHistory, []);

useCommands(() =>
  isOpen.value
    ? [
        {
          group: GENSHIN_DEV_COMMAND_GROUP,
          id: "run-console-line",
          meaning: UiIconMeaning.Command,
          shortcut: "enter",
          title: "Run the console line",
        },
        {
          group: GENSHIN_DEV_COMMAND_GROUP,
          id: "close-console",
          meaning: UiIconMeaning.Close,
          shortcut: "escape",
          title: "Close the developer console",
        },
      ]
    : [],
);
</script>

<template>
  <UiFrame
    v-if="isOpen"
    fixed
    bottom="[var(--dock-inset-block-end)]"
    left="[var(--dock-inset-inline-start)]"
    right-0
    title="Developer console"
    @keydown.stop="
      (event: KeyboardEvent) => {
        if (event.code === 'Escape') isOpen = false;
      }
    "
  >
    <ol max-h="[40dvh]" overflow-y-auto flex flex-col gap-1>
      <li v-for="(entry, index) in entries" :key="index" ui-row>
        <UiItemContent
          :title="entry.line"
          :description="entry.result.ok ? String(entry.result.value) : `${entry.result.error} — ${entry.result.usage}`"
          :meaning="entry.result.ok ? UiIconMeaning.Success : UiIconMeaning.Failure"
        />
      </li>
    </ol>
    <UiForm
      @submit="
        () => {
          if (line !== '')
            entries = [...entries, { line, result: registry.run(line) }].slice(-GENSHIN_DEV_CONSOLE_HISTORY_LENGTH);
          line = '';
        }
      "
    >
      <UiTextField
        v-model="line"
        is-autofocus
        is-label-hidden
        label="Developer console line"
        placeholder="set cloud coverage 0.8"
      />
    </UiForm>
  </UiFrame>
</template>
