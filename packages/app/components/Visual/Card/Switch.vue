<script setup lang="ts">
import { CardType } from "@/models/visual/CardType";

const modelValue = defineModel<CardType>({ required: true });
// false = CardType.Marquee (default)
// true = CardType.Carousel
const modelSwitch = computed<boolean>({
  get: () => modelValue.value === CardType.Carousel,
  set: (newCardType) => {
    modelValue.value = newCardType ? CardType.Carousel : CardType.Marquee;
  },
});
</script>

<template>
  <v-switch v-model="modelSwitch" hide-details>
    <template #prepend>
      {{ CardType.Marquee }}
    </template>
    <template #append>
      {{ CardType.Carousel }}
    </template>
  </v-switch>
</template>
