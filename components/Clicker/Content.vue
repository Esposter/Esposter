<script setup lang="ts">
import { usePopupStore } from "@/store/clicker/popup";

const popupStore = usePopupStore();
const { onClick } = popupStore;
</script>

<template>
  <div mt-12 relative>
    <ClickerModelRotatingCursors />
    <ClickerModelItem relative w-64 h-64 :g-attrs="{ class: 'clickable', cursor: 'pointer' }" @click="onClick" />
  </div>
</template>

<style scoped lang="scss">
:deep(.clickable:active) {
  transform: $click-shrink;
  transform-origin: center;
}
</style>
