<script setup lang="ts">
import { VBtn } from "vuetify/components";

const slots = defineSlots<InstanceType<typeof VBtn>["$props"]>();
</script>

<template>
  <v-btn class="button" un-color="#fff!" case="normal!">
    <ClientOnly>
      <template v-for="(_, slot) of slots" #[slot]="scope">
        <slot :name="slot" :="{ ...scope }" />
      </template>
    </ClientOnly>
  </v-btn>
</template>

<style scoped lang="scss">
.button {
  background-image: $midnightBloom !important;
}
</style>
