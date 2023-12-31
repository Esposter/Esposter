<script setup lang="ts">
import { type Card } from "@/models/visual/Card";
import { CardType } from "@/models/visual/CardType";

const cards: Card[] = [{ text: "Braedon Wooding" }, { text: "Ryan Fallah" }, { text: "Arsentiy Zakharchenko" }];
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
      <v-row pt-12>
        <v-col>
          <AboutContent />
        </v-col>
      </v-row>
      <v-row pt-12>
        <v-col class="text-h5" flex justify-center text-center font="Montserrat!">
          Thanks to all these lovely people for making this possible! 💖
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" flex justify-end>
          <div>
            <v-switch
              @click="
                () => {
                  if (cardType === CardType.Marquee) cardType = CardType.Carousel;
                  else cardType = CardType.Marquee;
                }
              "
            >
              <template #prepend>
                {{ CardType.Marquee }}
              </template>
              <template #append>
                {{ CardType.Carousel }}
              </template>
            </v-switch>
          </div>
        </v-col>
        <v-col cols="12">
          <VisualCardMarquee v-if="cardType === CardType.Marquee" :cards="cards" />
          <VisualCardCarousel v-else :cards="cards" />
        </v-col>
      </v-row>
    </v-container>
  </NuxtLayout>
</template>
