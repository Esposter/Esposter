<script setup lang="ts">
import type { VCard } from "vuetify/components";

import { mergeProps } from "vue";

interface StyledCardProps {
  cardAttrs?: VCard["$attrs"];
  cardProps?: VCard["$props"];
}

const { cardAttrs = {}, cardProps = {} } = defineProps<StyledCardProps>();
const slots = defineSlots<Record<keyof VCard["$slots"], Function>>();
</script>

<template>
  <v-card class="border-sm" :="mergeProps(cardProps, cardAttrs)">
    <template v-for="(_, slot) of slots" #[slot]="scope">
      <slot :name="slot" :="{ ...scope }" />
    </template>
  </v-card>
</template>
