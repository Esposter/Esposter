<script setup lang="ts">
import { Card } from "@/components/Visual/types";

const cards: Card[] = [
  { text: "Braedon Wooding1" },
  { text: "Braedon Wooding2" },
  { text: "Braedon Wooding3" },
  { text: "Braedon Wooding4" },
  { text: "Braedon Wooding5" },
  { text: "Braedon Wooding6" },
  { text: "Braedon Wooding7" },
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
        <VisualCardCarousel :cards="cards" />
      </v-row>
    </v-container>
  </NuxtLayout>
</template>
