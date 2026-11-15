<script setup lang="ts">
import type { UiCommand } from "#src/models/ui/UiCommand";

import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { DOCK_POPOVER_POSITION_AREA } from "#src/services/app/constants";
import { runCommand } from "#src/services/ui/runCommand";

interface Props {
  commands: UiCommand[];
  label: string;
}
// One of the dock's menus over commands the palette offers too, so the two never disagree: a heading wherever the
// Group changes, and the chosen member of a choice marked
defineSlots<{ default: () => VNode }>();
const { commands } = defineProps<Props>();
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
