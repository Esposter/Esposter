<script setup lang="ts">
// Nuxt's own progress through a page load, drawn as the library's line along the top edge
const { isLoading, progress } = useLoadingIndicator();
</script>

<template>
  <UiLoadingLine
    v-if="isLoading"
    label="Loading the page"
    :value="progress"
    pointer-events-none
    left-0
    right-0
    top-0
    fixed
    z-2000
  />
</template>
