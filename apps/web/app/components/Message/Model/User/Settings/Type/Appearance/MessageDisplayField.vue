<script setup lang="ts">
import { MessageDisplayModeItems } from "#src/services/message/user/settings/MessageDisplayModeItems";
import { useAppearanceStore } from "#src/store/message/ui/appearance";

const appearanceStore = useAppearanceStore();
const { messageDisplayMode } = storeToRefs(appearanceStore);
</script>

<template>
  <UiRadioGroup v-model="messageDisplayMode" :items="MessageDisplayModeItems" label="Message display" />
</template>
