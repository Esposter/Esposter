<script setup lang="ts">
defineSlots<{ default: () => VNode }>();
const emit = defineEmits<{ click: [] }>();
</script>

<!-- Inline text that runs an action rather than navigating, so it cannot be a NuxtLink: link-blue, underlined on
     hover the way a link is, and carrying the keyboard and role wiring an anchor would have given for free -->
<template>
  <span
    text-info
    cursor-pointer
    hover:underline
    role="button"
    tabindex="0"
    @click="emit('click')"
    @keydown.enter.prevent="emit('click')"
    @keydown.space.prevent="emit('click')"
  >
    <slot />
  </span>
</template>
