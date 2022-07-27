<script setup lang="ts">
import { Card } from "@/components/Visual/types";

const cards: Card[] = [
  { idField: "1", text: "Braedon Wooding" },
  { idField: "2", text: "Braedon Wooding" },
  { idField: "3", text: "Braedon Wooding" },
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
