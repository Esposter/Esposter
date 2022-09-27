<script setup lang="ts">
import { VCard } from "vuetify/components";

// @NOTE: Will be fixed in Vue 3.3
// const props = defineProps<typeof VCard>();
const { border } = useGlobalTheme().value.colors;
</script>

<template>
  <v-card class="border">
    <template v-for="(_, slot) of $slots" #[slot]="scope"><slot :name="slot" :="scope" /></template>
  </v-card>
</template>

<style scoped lang="scss">
.border {
  border: 1px solid v-bind(border) !important;
}
</style>
