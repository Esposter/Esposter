<script setup lang="ts">
import type { UiCommand } from "@/models/ui/UiCommand";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { DOCK_POPOVER_POSITION_AREA } from "@/services/app/constants";
import { runCommand } from "@/services/ui/runCommand";

interface Props {
  commands: UiCommand[];
  label: string;
}

// One of the dock's menus over commands the palette offers too, so the two never disagree: a heading wherever the
// Group changes, and the chosen member of a choice marked
defineSlots<{ default: () => VNode }>();
const { commands, label } = defineProps<Props>();
const items = computed(() =>
  commands.map(({ description, group, icon, id, isSelected, meaning, title }, index) => ({
    description,
    icon,
    isGroupStart: group !== commands[index - 1]?.group,
    isSelected,
    meaning,
    title,
    value: id,
  })),
);
</script>

<template>
  <UiMenu
    :items
    :label
    :position-area="DOCK_POPOVER_POSITION_AREA"
    :variant="UiButtonVariant.Quiet"
    p-0
    size-10
    @select="
      async (value) => {
        const command = commands.find(({ id }) => id === value);
        if (command) await runCommand(command);
      }
    "
  >
    <slot />
  </UiMenu>
</template>
