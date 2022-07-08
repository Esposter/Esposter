<script setup lang="ts">
useHead({ titleTemplate: (title) => (title ? `Esbabbler | ${title}` : "Esbabbler") });
</script>

<template>
  <div>
    <slot />
  </div>
</template>
