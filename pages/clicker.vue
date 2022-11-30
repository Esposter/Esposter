<script setup lang="ts">
import { useGameStore } from "@/store/clicker/useGameStore";
import { storeToRefs } from "pinia";

const gameStore = useGameStore();
const { game } = $(storeToRefs(gameStore));
</script>

<template>
  <NuxtLayout>
    <v-container v-if="game" h="full" display="flex" justify="center" items="center" flex="col">
      <div class="text-h3" font="bold" select="none">{{ game.noPoints }} Piña Coladas</div>
      <ClickerPinaColada pt="12" />
    </v-container>
  </NuxtLayout>
</template>
