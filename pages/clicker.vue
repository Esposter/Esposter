<script setup lang="ts">
import ClickPopup from "@/components/Clicker/ClickPopup.vue";
import { useClickStore } from "@/store/clicker/useClickStore";
import { useGameStore } from "@/store/clicker/useGameStore";
import { storeToRefs } from "pinia";
import { v4 as uuidv4 } from "uuid";

const gameStore = useGameStore();
const { incrementPoints } = gameStore;
const { game } = $(storeToRefs(gameStore));
const clickStore = useClickStore();
const { clickPower } = $(storeToRefs(clickStore));
const popUps = $ref<({ id: string } & InstanceType<typeof ClickPopup>["$props"])[]>([]);
const onClick = ({ clientX, clientY }: MouseEvent) => {
  const id = uuidv4();
  const duration = 10000;
  incrementPoints(clickPower);
  popUps.push({ id, points: clickPower, clientX, clientY, duration });
  setTimeout(() => {
    const index = popUps.findIndex((p) => p.id === id);
    if (index > -1) popUps.splice(index, 1);
  }, duration);
};
</script>

<template>
  <NuxtLayout>
    <v-container v-if="game" h="full" display="flex" justify="center" items="center" flex="col">
      <div class="text-h3" text="center" font="bold" select="none">{{ game.noPoints }} Piña Coladas</div>
      <ClickerPinaColada mt="12" @click="onClick" />
    </v-container>
    <ClickerClickPopup v-for="{ id, ...popUpProps } in popUps" :key="id" :="popUpProps" />
  </NuxtLayout>
</template>
