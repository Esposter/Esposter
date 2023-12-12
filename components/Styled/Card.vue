<script setup lang="ts">
import type { VCard } from "vuetify/components";

const slots = defineSlots<Record<keyof VCard["$slots"], Function>>();
</script>

<template>
  <v-card class="border-sm">
    <template v-for="(_, slot) of slots" #[slot]="scope">
      <slot :name="slot" :="{ ...scope }" />
    </template>
  </v-card>
</template>
