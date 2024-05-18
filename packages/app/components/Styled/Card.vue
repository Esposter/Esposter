<script setup lang="ts">
import { VCard } from "vuetify/components";

interface StyledCardProps {
  cardProps?: VCard["$props"];
}

const { cardProps } = defineProps<StyledCardProps>();
const slots = defineSlots<Record<keyof VCard["$slots"], Function>>();
</script>

<template>
  <v-card class="border-sm" :="cardProps">
    <template v-for="(_, slot) of slots" #[slot]="scope">
      <slot :name="slot" :="{ ...scope }" />
    </template>
  </v-card>
</template>
