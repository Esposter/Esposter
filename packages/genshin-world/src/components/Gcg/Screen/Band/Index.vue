<script setup lang="ts">
interface Props {
  // The phase's name in the reader's language
  label: string;
}

defineProps<Props>();
</script>

<template>
  <!-- The band across the board between the two rows, naming the phase -->
  <div class="band">{{ label }}</div>
</template>

<style scoped>
.band {
  position: absolute;
  top: calc(var(--unit) * 512);
  right: 0;
  left: 0;
  height: calc(var(--unit) * 56);
  background: #6f6857;
  color: #f6e3a1;
  font-size: calc(var(--unit) * 38);
  font-weight: 700;
  line-height: calc(var(--unit) * 56);
  text-align: center;
}
</style>
