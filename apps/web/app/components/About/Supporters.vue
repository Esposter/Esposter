<script setup lang="ts">
import VisualCardCarousel from "#src/components/Visual/Card/Carousel.vue";
import VisualCardMarquee from "#src/components/Visual/Card/Marquee.vue";
import { CardType, CardTypes } from "#src/models/visual/CardType";
import { SupporterCards } from "#src/services/about/SupporterCards";
import { TAB_QUERY_PARAMETER_KEY } from "#src/services/route/constants";
import { CardTypeItems } from "#src/services/visual/CardTypeItems";

const cardType = useEnumRouteQuery(TAB_QUERY_PARAMETER_KEY, CardTypes, CardType.Marquee);
// Keyed by card type, so a new type is a compile error until it names the view that draws it, rather than
// Falling through to the carousel
const cardComponentMap = {
  [CardType.Carousel]: VisualCardCarousel,
  [CardType.Marquee]: VisualCardMarquee,
} as const satisfies Record<CardType, Component>;
</script>

<template>
  <section flex flex-col gap-4 w-full>
    <h2 text-center ui-title>Thanks to all these lovely people for making this possible! 💖</h2>
    <UiTabs v-model="cardType" :items="CardTypeItems" label="How the supporters are shown">
      <template #default="{ value }">
        <component :is="cardComponentMap[value]" :cards="SupporterCards" />
      </template>
    </UiTabs>
  </section>
</template>
