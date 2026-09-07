<script setup lang="ts">
import { CardType } from "@/models/visual/CardType";
import { SupporterCards } from "@/services/about/SupporterCards";

const cardType = ref(CardType.Marquee);
</script>

<template>
  <v-row pt-12>
    <v-col text-center flex justify-center text-headline-small font="[Montserrat]" cols="12">
      Thanks to all these lovely people for making this possible! 💖
    </v-col>
    <v-col cols="12" flex justify-end>
      <VisualCardSwitch v-model="cardType" />
    </v-col>
    <v-col cols="12">
      <VisualCardMarquee v-if="cardType === CardType.Marquee" :cards="SupporterCards" />
      <VisualCardCarousel v-else :cards="SupporterCards" />
    </v-col>
  </v-row>
</template>
