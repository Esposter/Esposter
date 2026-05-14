<script setup lang="ts">
import type { Card } from "@/models/visual/Card";

import { CardType } from "@/models/visual/CardType";

const supporters = ["Braedon Wooding", "Ryan Fallah", "Arsentiy Zakharchenko", "Bill Do", "Leila Yuan", "Kevin Chen"];
const cards: Card[] = supporters.map((s) => ({ text: s }));
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
      <VisualCardMarquee v-if="cardType === CardType.Marquee" :cards />
      <VisualCardCarousel v-else :cards />
    </v-col>
  </v-row>
</template>
