<script setup lang="ts">
import type { VCard } from "vuetify/components";
// @TODO: https://github.com/vuejs/core/issues/11371
interface Props {
  cardProps?: VCard["$props"];
}

const slots = defineSlots<Record<keyof VCard["$slots"], () => VNode>>();
const { cardProps = {} } = defineProps<Props>();
</script>

<template>
  <v-card b-1 :="cardProps">
    <template v-for="(_slot, name) of slots" #[name]="scope">
      <slot :name :="scope" />
    </template>
  </v-card>
</template>
