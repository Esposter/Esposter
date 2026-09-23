<script setup lang="ts">
import { CardType } from "@/models/visual/CardType";
import { SupporterCards } from "@/services/about/SupporterCards";
import { CardTypeItems } from "@/services/visual/CardTypeItems";

const cardType = ref(CardType.Marquee);
</script>

<template>
  <section flex flex-col gap-4 w-full>
    <h2 text-center ui-heading>Thanks to all these lovely people for making this possible! 💖</h2>
    <UiTabs v-model="cardType" :items="CardTypeItems" label="How the supporters are shown">
      <template #default="{ value }">
        <VisualCardMarquee v-if="value === CardType.Marquee" :cards="SupporterCards" />
        <VisualCardCarousel v-else :cards="SupporterCards" />
      </template>
    </UiTabs>
  </section>
</template>
