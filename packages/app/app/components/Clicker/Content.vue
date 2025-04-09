<script setup lang="ts">
import { usePopupStore } from "@/store/clicker/popup";

const popupStore = usePopupStore();
const { onClick } = popupStore;
</script>

<template>
  <div mt-12 relative>
    <ClientOnly>
      <ClickerModelRotatingCursors />
    </ClientOnly>
    <ClickerModelItem
      relative
      size-50
      :g-attrs="{ cursor: 'pointer', 'origin-center': '', 'active:scale-95': '' }"
      @click="onClick"
    />
  </div>
</template>
