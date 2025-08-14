<script setup lang="ts">
import { useEsbabblerStore } from "@/store/esbabbler";

const esbabblerStore = useEsbabblerStore();
const { copied, text } = storeToRefs(esbabblerStore);
</script>

<template>
  <div class="bg-surface" relative flex h-full flex-col>
    <EsbabblerContentHeader />
    <v-divider />
    <EsbabblerContentMessages />
    <StyledClipboardSnackbar v-model="copied" :source="text" />
  </div>
</template>
