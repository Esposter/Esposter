<script setup lang="ts">
import { useDragStore } from "@/store/flowchartEditor/drag";

const dragStore = useDragStore();
const { isDragOver } = storeToRefs(dragStore);
</script>

<template>
  <v-overlay v-model="isDragOver" contained items-center text-xl justify-center>Drop here</v-overlay>
</template>
