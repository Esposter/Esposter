<script setup lang="ts">
import { usePopupStore } from "@/store/clicker/usePopupStore";
import { storeToRefs } from "pinia";

const popupStore = usePopupStore();
const { popups } = $(storeToRefs(popupStore));
</script>

<template>
  <ClickerModelClickPopup v-for="{ id, ...popupProps } in popups" :key="id" :="popupProps" />
</template>
