<script setup lang="ts">
import DiscButton from "#src/components/DiscButton/Index.vue";

interface Props {
  // What the button does, for a screen reader, since it shows its cross alone
  label: string;
}

defineProps<Props>();
</script>

<template>
  <!-- The shop's way out: a white disc 56 units across at the head's right, with a cross drawn in it -->
  <DiscButton class="close-button" :label :size="56">
    <svg class="cross" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 6 18 18M18 6 6 18" />
    </svg>
  </DiscButton>
</template>

<style scoped src="../../../styles/shopScreen.css"></style>

<style scoped>
.close-button {
  position: absolute;
  top: calc(var(--unit) * 19);
  left: calc(var(--unit) * 1815);
}
</style>
