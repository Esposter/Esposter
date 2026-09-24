<script setup lang="ts">
import { useCommandStore } from "@/store/ui/command";

const commandStore = useCommandStore();
const { commands, isShortcutsDialogOpen } = storeToRefs(commandStore);
// Every key that works on the page in front of the reader, under the surface that registered it
const groupShortcutCommandsMap = computed(() =>
  Map.groupBy(
    commands.value.filter(({ shortcut }) => shortcut),
    ({ group }) => group,
  ),
);
</script>

<template>
  <UiDialog v-model="isShortcutsDialogOpen" title="Keyboard shortcuts" max-w-120 w-full>
    <div p-3 flex flex-col gap-4 of-y-auto>
      <section v-for="[group, groupCommands] of groupShortcutCommandsMap" :key="group" flex flex-col gap-1>
        <h3 text-sm text-muted>{{ group }}</h3>
        <div
          v-for="{ icon, id, image, meaning, shortcut, title } of groupCommands"
          :key="id"
          px-2
          flex
          gap-2
          min-h-8
          items-center
        >
          <UiItemContent :icon :image :meaning :shortcut :title />
        </div>
      </section>
    </div>
  </UiDialog>
</template>
