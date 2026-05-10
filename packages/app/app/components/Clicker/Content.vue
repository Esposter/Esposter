<script setup lang="ts">
import { usePopupStore } from "@/store/clicker/popup";

const popupStore = usePopupStore();
const { onClick } = popupStore;
</script>

<template>
  <div relative mt-12>
    <ClientOnly>
      <ClickerModelRotatingCursors />
    </ClientOnly>
    <ClickerModelItem
      relative
      size-50
      :g-attrs="{ class: 'origin-center active:scale-95', cursor: 'pointer' }"
      @click="onClick"
    />
  </div>
</template>
