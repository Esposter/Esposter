<script setup lang="ts">
import { useSettingsStore } from "@/store/message/room/settings";

const settingsStore = useSettingsStore();
const { dialog } = storeToRefs(settingsStore);
</script>

<template>
  <MessageModelSettingsRightSideBar @close="dialog = false" />
</template>
