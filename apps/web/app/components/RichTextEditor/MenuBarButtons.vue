<script setup lang="ts">
import type { MenuItem } from "#src/models/shared/MenuItem";
import type { Editor } from "@tiptap/core";

import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { checkIsDivider } from "#src/services/shared/checkIsDivider";

interface Props {
  editor?: Editor;
  items: MenuItem[];
}

defineProps<Props>();
</script>

<template>
  <template v-for="(item, index) of items" :key="index">
    <div
      v-if="checkIsDivider(item)"
      aria-hidden="true"
      mx-1
      bg-divider
      shrink-0
      h-6
      w="[var(--ui-border-width)]"
      self-center
    />
    <UiTooltip v-else #default="{ activatorProps }" :label="item.title">
      <!-- A mark that says whether it is on, such as bold, is a toggle; one that only acts, such as undo, is not. Each acts
        on the editor's selection, which exists only while the editor is focused, so the buttons are disabled outside it,
        except an item that needs no selection. Focus and blur each dispatch a transaction, which re-renders the bar, and a
        press keeps the focus where it is so the button stays enabled through its own click -->
      <UiButton
        :="activatorProps"
        :aria-label="item.title"
        :aria-pressed="item.active"
        :disabled="item.disabled || (!item.isSelectionFree && !editor?.isFocused)"
        :variant="UiButtonVariant.Quiet"
        px-0
        @click="item.onClick?.($event)"
        @mousedown.prevent
      >
        <span :class="item.icon" aria-hidden="true" align-middle size-6 inline-block />
      </UiButton>
    </UiTooltip>
  </template>
</template>
