<script setup lang="ts">
import type { UiCommand } from "#src/models/ui/UiCommand";

import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";

interface Props {
  command: UiCommand;
  // Whether the arrows have reached this option, which the listbox reads as selected
  isHighlighted: boolean;
}
// One command as an option of the list: a real link when it has somewhere to go, and a click that does nothing while it
// Is disabled, so the keyboard and the pointer both reach it through the one click
defineProps<Props>();
const emit = defineEmits<{ select: [command: UiCommand] }>();
const NuxtInvisibleLink = resolveComponent("NuxtInvisibleLink");
</script>

<template>
  <component
    :is="command.to ? NuxtInvisibleLink : 'div'"
    class="aria-disabled:op-disabled"
    ui-item
    :="command.to ? { to: command.to } : {}"
    :aria-disabled="command.isDisabled || undefined"
    :aria-selected="isHighlighted"
    role="option"
    @click="() => {
      if (!command.isDisabled) emit('select', command);
    }"
    @mousedown.prevent
  >
    <UiItemContent
      :description="command.description"
      :icon="command.icon"
      :image="command.image"
      :meaning="command.meaning"
      :shortcut="command.shortcut"
      :title="command.title"
    >
      <template v-if="command.isSelected" #append>
        <UiIcon :meaning="UiIconMeaning.Selected" label="Chosen" text-accent />
      </template>
    </UiItemContent>
  </component>
</template>
