<script setup lang="ts">
interface HeaderProps {
  isTopAttached?: boolean;
}

const { isTopAttached } = defineProps<HeaderProps>();
const emit = defineEmits<{ close: [] }>();
</script>

<template>
  <div :class="isTopAttached ? '' : 'rd-t-2'" relative flex items-center gap-2 text-sm px-4 py-2 bg-background>
    <slot />
    <v-btn
      top="1/2"
      absolute
      right-4
      b-1
      b-solid
      b-text
      translate-y="-1/2"
      icon="mdi-close"
      size="small"
      density="compact"
      @click="emit('close')"
    />
  </div>
</template>
