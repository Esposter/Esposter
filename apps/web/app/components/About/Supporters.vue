<script setup lang="ts">
import { CardType, CardTypes } from "@/models/visual/CardType";
import { SupporterCards } from "@/services/about/SupporterCards";
import { TAB_QUERY_PARAMETER_KEY } from "@/services/route/constants";
import { CardTypeItems } from "@/services/visual/CardTypeItems";

const cardType = useEnumRouteQuery(TAB_QUERY_PARAMETER_KEY, CardTypes, CardType.Marquee);
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
