<script setup lang="ts">
import type { VNode } from "vue";

interface Props {
  // The dialog's title, which heads its panel and names it to a screen reader
  title: string;
}

// The default slot is the body, which the panel scrolls with; the footer slot is the row drawn under it, in the same panel
defineSlots<{ default: () => VNode; footer?: () => VNode }>();
defineProps<Props>();
</script>

<template>
  <div class="dialog" role="dialog" aria-modal="true" :aria-label="title">
    <p class="title" role="heading" aria-level="2">{{ title }}</p>
    <slot />
    <div v-if="$slots.footer" class="footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<style scoped>
/* Provisional: the picker's panel sits over the menu at its centre until the parity compare fits it to the reference */
.dialog {
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  flex-direction: column;
  gap: calc(var(--unit) * 8);
  max-height: 70%;
  overflow-y: auto;
  padding: calc(var(--unit) * 16);
  background: rgb(14 22 32 / 92%);
  transform: translate(-50%, -50%);
}

/* A column of its own, so a control the footer aligns to its end still sits at the panel's right */
.footer {
  display: flex;
  flex-direction: column;
}

/* Provisional: the title's size and colour are the game's heading colour until the parity compare fits it */
.title {
  margin: 0;
  color: #d0bf9f;
  font-size: calc(var(--unit) * 27);
  font-weight: 600;
  text-align: center;
}
</style>
