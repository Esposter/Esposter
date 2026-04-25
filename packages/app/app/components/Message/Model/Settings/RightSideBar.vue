<script setup lang="ts">
import { useColorsStore } from "@/store/colors";

const emit = defineEmits<{ close: [event: MouseEvent] }>();
const colorsStore = useColorsStore();
const { border } = storeToRefs(colorsStore);
</script>

<template>
  <v-navigation-drawer :width="96" location="right" floating permanent>
    <div pt-10 flex justify-center>
      <v-btn class="border-color" icon="mdi-close" border="md" @click="emit('close', $event)" />
    </div>
  </v-navigation-drawer>
</template>

<style scoped lang="scss">
.border-color {
  border-color: v-bind(border);
}
</style>
