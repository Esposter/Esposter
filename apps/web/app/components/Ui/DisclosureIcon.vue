<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
</script>

<!-- The disclosure mark a trigger draws, turned down while the cue whose attributes it takes reads open -->
<template>
  <UiIcon :meaning="UiIconMeaning.Disclosure" />
</template>

<style scoped>
[data-state="open"] {
  rotate: 90deg;
}
</style>
