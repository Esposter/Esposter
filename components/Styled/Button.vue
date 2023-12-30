<script setup lang="ts">
import { VBtn } from "vuetify/components";

const attrs = useAttrs();
const slots = defineSlots<Record<keyof VBtn["$slots"], Function>>();
</script>

<template>
  <!-- @TODO: Using attrs here to inherit behaviour, no type-safety since Vue doesn't support defineProps<VBtn["$props"]> yet -->
  <v-btn class="button" un-color="#fff!" case-normal="!" :="attrs">
    <template v-for="(_, slot) of slots" #[slot]>
      <slot :name="slot" />
    </template>
  </v-btn>
</template>

<style scoped lang="scss">
.button {
  background-image: $midnight-bloom !important;
}
</style>
