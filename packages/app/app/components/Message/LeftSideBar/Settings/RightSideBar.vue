<script setup lang="ts">
import { useSettingsStore } from "@/store/message/settings";

const settingsStore = useSettingsStore();
const { dialog } = storeToRefs(settingsStore);
const { border } = useColors();
</script>

<template>
  <v-navigation-drawer :width="96" location="right" floating permanent>
    <div pt-10 flex justify-center>
      <v-btn class="border-color" icon="mdi-close" border="md" @click="dialog = false" />
    </div>
  </v-navigation-drawer>
</template>

<style scoped lang="scss">
.border-color {
  border-color: v-bind(border) !important;
}
</style>
