<script setup lang="ts">
// Parent route for /resources/** — resource search is explorer chrome, not app chrome,
// So the palette, shortcuts overlay, and keyboard chords mount here instead of app.vue
useResourceKeyboardShortcuts();
</script>

<template>
  <div contents>
    <NuxtPage />
    <ResourceSearchDialog />
    <ResourceShortcutsOverlay />
  </div>
</template>
