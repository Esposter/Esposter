<script setup lang="ts">
import type { Card } from "@/models/visual/Card";

import { CardType } from "@/models/visual/CardType";

const supporters = ["Braedon Wooding", "Ryan Fallah", "Arsentiy Zakharchenko", "Bill Do", "Leila Yuan", "Kevin Chen"];
const cards: Card[] = supporters.map((s) => ({ text: s }));
const cardType = ref(CardType.Marquee);
</script>

<template>
  <NuxtLayout>
    <v-container>
      <v-row>
        <v-col flex justify-center>
          <VisualGem />
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <AboutHeader />
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <AboutContent />
        </v-col>
      </v-row>
      <v-row pt-12>
        <v-col class="text-h5" flex justify-center text-center font="[Montserrat]" cols="12">
          Thanks to all these lovely people for making this possible! 💖
        </v-col>
        <v-col cols="12" flex justify-end>
          <div>
            <VisualCardSwitch v-model="cardType" />
          </div>
        </v-col>
        <v-col cols="12">
          <VisualCardMarquee v-if="cardType === CardType.Marquee" :cards />
          <VisualCardCarousel v-else :cards />
        </v-col>
      </v-row>
      <v-row pt-12>
        <v-col class="text-h5" flex justify-center text-center font="[Montserrat]" cols="12">
          Here's a globe for you to play around with if you are bored 🙂
        </v-col>
        <v-col flex justify-center>
          <VisualGlobe />
        </v-col>
      </v-row>
    </v-container>
  </NuxtLayout>
</template>
