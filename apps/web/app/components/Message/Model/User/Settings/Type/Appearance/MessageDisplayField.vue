<script setup lang="ts">
import { MessageDisplayModeItems } from "@/services/message/user/settings/MessageDisplayModeItems";
import { useAppearanceStore } from "@/store/message/ui/appearance";

const appearanceStore = useAppearanceStore();
const { messageDisplayMode } = storeToRefs(appearanceStore);
</script>

<template>
  <UiRadioGroup v-model="messageDisplayMode" :items="MessageDisplayModeItems" label="Message display" />
</template>
