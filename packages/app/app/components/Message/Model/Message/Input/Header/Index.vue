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
  <div class="bg-background" :class="isTopAttached ? '' : 'rd-t-2'" relative text-sm px-4 py-2 flex items-center gap-2>
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

<style scoped lang="scss">
.custom-border {
  border: $border-width-root $border-style-root v-bind(text);
}
</style>
