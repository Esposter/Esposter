<script setup lang="ts">
import type { UiToken } from "@/models/ui/UiToken";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props {
  meaning?: UiIconMeaning;
  // Names the button inside it that takes it away, which only a chip with one draws: "Remove spam"
  removeLabel?: string;
  // A colour that tells what kind of thing it names, such as a column's type: a block of it before the text
  token?: UiToken;
}

// A short reading set into the surface it sits on — a count, a size, a kind — rather than something to press. Its
// Mark and its block are decoration beside the words, which say it all. One the reader added, such as a filtered
// Word, holds a quiet button that takes it away again
defineSlots<{ default: () => VNode }>();
const { meaning, removeLabel, token } = defineProps<Props>();
const emit = defineEmits<{ remove: [] }>();
</script>

<template>
  <span text-sm px-2 inline-flex gap-1 h-6 items-center ui-field ui-pill>
    <span v-if="token" :style="{ backgroundColor: `var(--ui-${token})` }" aria-hidden="true" shrink-0 size-2 />
    <UiIcon v-if="meaning" :meaning />
    <slot />
    <!-- The mark alone, as tall as the chip rather than a control's height, so the chip keeps its own -->
    <button
      v-if="removeLabel"
      :aria-label="removeLabel"
      type="button"
      text-muted
      flex
      shrink-0
      cursor-pointer
      ui-pill
      hover:text-inherit
      @click="emit('remove')"
    >
      <UiIcon :meaning="UiIconMeaning.Remove" />
    </button>
  </span>
</template>
