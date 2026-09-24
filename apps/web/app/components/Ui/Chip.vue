<script setup lang="ts">
import type { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import type { UiToken } from "@/models/ui/UiToken";

interface Props {
  meaning?: UiIconMeaning;
  // A colour that tells what kind of thing it names, such as a column's type: a block of it before the text
  token?: UiToken;
}

// A short reading set into the surface it sits on — a count, a size, a kind — rather than something to press. Its
// Mark and its block are decoration beside the words, which say it all
defineSlots<{ default: () => VNode }>();
const { meaning, token } = defineProps<Props>();
</script>

<template>
  <span text-sm px-2 inline-flex gap-1 h-6 items-center ui-sunk>
    <span v-if="token" :style="{ backgroundColor: `var(--ui-${token})` }" aria-hidden="true" shrink-0 size-2 />
    <UiIcon v-if="meaning" :meaning />
    <slot />
  </span>
</template>
