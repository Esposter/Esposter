<script setup lang="ts">
import { usePopupStore } from "#src/store/clicker/popup";

const popupStore = usePopupStore();
const { popups } = storeToRefs(popupStore);
</script>

<template>
  <ClickerModelPointsPopup v-for="{ id, ...popupProps } of popups" :key="id" :="popupProps" />
</template>
