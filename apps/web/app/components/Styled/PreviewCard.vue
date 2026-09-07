<script setup lang="ts">
defineSlots<{ default: () => VNode }>();
</script>

<template>
  <div py-2 b-1 b-text rd-lg b-solid shadow-md>
    <slot />
  </div>
</template>
