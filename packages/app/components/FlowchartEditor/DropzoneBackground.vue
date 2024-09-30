<script setup lang="ts">
import { useDragStore } from "@/store/flowchartEditor/drag";

const dragStore = useDragStore();
const { isDragOver } = storeToRefs(dragStore);
</script>

<template>
  <v-overlay v-model="isDragOver" justify-center items-center contained>Drop here</v-overlay>
</template>
