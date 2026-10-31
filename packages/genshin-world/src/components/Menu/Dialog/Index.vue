<script setup lang="ts">
interface Props {
  // The dialog's title, which heads its panel and names it to a screen reader
  title: string;
}

defineSlots<{ default: () => VNode }>();
const { title } = defineProps<Props>();
</script>

<template>
  <div class="dialog" role="dialog" aria-modal="true" :aria-label="title">
    <p class="title" role="heading" aria-level="2">{{ title }}</p>
    <slot />
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

/* Provisional: the title's size and colour are the game's heading colour until the parity compare fits it */
.title {
  margin: 0;
  color: #d0bf9f;
  font-size: calc(var(--unit) * 27);
  font-weight: 600;
  text-align: center;
}
</style>
