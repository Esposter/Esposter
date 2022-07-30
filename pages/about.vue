<script setup lang="ts">
import { Card } from "@/components/Visual/types";

const cards: Card[] = [
  { text: "Braedon Wooding" },
  { text: "Ryan Fallah" },
  { text: "Arsentiy Zakharchenko" },
  { text: "Braedon Wooding" },
  { text: "Ryan Fallah" },
  { text: "Arsentiy Zakharchenko" },
];
</script>

<template>
  <NuxtLayout>
    <v-container fluid>
      <v-row>
        <v-col display="flex" justify="center">
          <VisualGem />
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <AboutHeader />
        </v-col>
      </v-row>
      <v-row>
        <v-col class="text-h5" display="flex" justify="center" text="center" font="Montserrat!">
          Thanks to all these lovely people for making this possible! 💖
        </v-col>
      </v-row>
      <v-row m="0" pt="8">
        <VisualCardCarousel :cards="cards" />
      </v-row>
    </v-container>
  </NuxtLayout>
</template>
