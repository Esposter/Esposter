<script setup lang="ts">
import { useColorsStore } from "@/store/colors";

const emit = defineEmits<{ close: [event: MouseEvent] }>();
const colorsStore = useColorsStore();
const { border } = storeToRefs(colorsStore);
</script>

<template>
  <v-navigation-drawer :width="96" location="right" floating permanent>
    <div flex pt-10 justify-center>
      <v-btn class="border-color" icon="mdi-close" b-2 @click="emit('close', $event)" />
    </div>
  </v-navigation-drawer>
</template>

<style scoped>
.border-color {
  border-color: v-bind(border);
}
</style>
