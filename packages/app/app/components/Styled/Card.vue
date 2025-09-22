<script setup lang="ts">
import type { VCard } from "vuetify/components";

import { mergeProps } from "vue";

interface StyledCardProps {
  cardAttrs?: VCard["$attrs"];
  cardProps?: VCard["$props"];
}

const { cardAttrs = {}, cardProps = {} } = defineProps<StyledCardProps>();
const slots = defineSlots<Record<keyof VCard["$slots"], () => VNode>>();
</script>

<template>
  <v-card class="border-sm" :="mergeProps(cardProps, cardAttrs)">
    <template v-for="(_slot, name) of slots" #[name]="scope">
      <slot :name :="{ ...scope }" />
    </template>
  </v-card>
</template>
