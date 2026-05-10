<script setup lang="ts">
import { useDragStore } from "@/store/flowchartEditor/drag";

const dragStore = useDragStore();
const { isDragOver } = storeToRefs(dragStore);
</script>

<template>
  <v-overlay v-model="isDragOver" items-center text-xl contained justify-center>Drop here</v-overlay>
</template>
