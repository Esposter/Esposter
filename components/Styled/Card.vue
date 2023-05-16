<script setup lang="ts">
import { VCard } from "vuetify/components";

const slots = defineSlots<InstanceType<typeof VCard>["$props"]>();
const { border } = useColors();
</script>

<template>
  <v-card class="border">
    <ClientOnly>
      <template v-for="(_, slot) of slots" #[slot]="scope">
        <slot :name="slot" :="{ ...scope }" />
      </template>
    </ClientOnly>
  </v-card>
</template>

<style scoped lang="scss">
.border {
  border: 1px solid v-bind(border) !important;
}
</style>
