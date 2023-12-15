<script setup lang="ts">
import { type Card } from "@/models/visual/Card";

const cards: Card[] = [{ text: "Braedon Wooding" }, { text: "Ryan Fallah" }, { text: "Arsentiy Zakharchenko" }];
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
      <v-row pt-8>
        <VisualCardCarousel :cards="cards" />
      </v-row>
    </v-container>
  </NuxtLayout>
</template>
