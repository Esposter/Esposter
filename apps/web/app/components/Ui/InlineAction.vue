<script setup lang="ts">
// Something to do inside a line of text, such as a system line's "Edit Room": read as a link in the info colour, which
// Underlines while pointed at or focused, and never a raised button that would break the sentence around it
defineSlots<{ default: () => VNode }>();
</script>

<template>
  <button type="button" text-info cursor-pointer hover:underline focus-visible:underline>
    <slot />
  </button>
</template>
