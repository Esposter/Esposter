<script setup lang="ts">
interface HeaderProps {
  isTopAttached?: boolean;
}

const { isTopAttached } = defineProps<HeaderProps>();
const emit = defineEmits<{ close: [] }>();
</script>

<template>
  <div :class="isTopAttached ? '' : 'rd-t-2'" px-4 py-2 bg-background flex gap-2 items-center relative text-body-medium>
    <slot />
    <v-btn
      top="1/2"
      b-1
      b-text
      b-solid
      right-4
      absolute
      translate-y="-1/2"
      icon="mdi-close"
      size="small"
      density="compact"
      @click="emit('close')"
    />
  </div>
</template>
