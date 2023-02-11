<script setup lang="ts">
import { usePopupStore } from "@/store/clicker/usePopupStore";

const popupStore = usePopupStore();
const { popups } = $(storeToRefs(popupStore));
</script>

<template>
  <ClickerModelPointsPopup v-for="{ id, ...popupProps } in popups" :key="id" :="popupProps" />
</template>
