<script setup lang="ts">
import { useColorsStore } from "@/store/colors";

interface HeaderProps {
  isTopAttached?: boolean;
}

const { isTopAttached } = defineProps<HeaderProps>();
const emit = defineEmits<{ close: [] }>();
const colorsStore = useColorsStore();
const { text } = storeToRefs(colorsStore);
</script>

<template>
  <div :class="isTopAttached ? '' : 'rd-t-2'" relative flex items-center gap-2 text-sm px-4 py-2 bg-background>
    <slot />
    <v-btn
      class="custom-border"
      absolute
      top="1/2"
      right-4
      translate-y="-1/2"
      icon="mdi-close"
      size="small"
      density="compact"
      @click="emit('close')"
    />
  </div>
</template>

<style scoped>
.custom-border {
  border: var(--border-width) var(--border-style) v-bind(text);
}
</style>
