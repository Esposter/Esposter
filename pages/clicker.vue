<script setup lang="ts">
import ClickPopup from "@/components/Clicker/ClickPopup.vue";
import { useCursorStore } from "@/store/clicker/useCursorStore";
import { useGameStore } from "@/store/clicker/useGameStore";
import { storeToRefs } from "pinia";
import { v4 as uuidv4 } from "uuid";

const gameStore = useGameStore();
const { incrementPoints } = gameStore;
const { game } = $(storeToRefs(gameStore));
const cursorStore = useCursorStore();
const { cursorPower } = $(storeToRefs(cursorStore));
const popUps = $ref<({ id: string } & InstanceType<typeof ClickPopup>["$props"])[]>([]);
const onClick = ({ pageX, pageY }: MouseEvent) => {
  const id = uuidv4();
  const duration = 10000;
  incrementPoints(cursorPower);
  popUps.push({ id, points: cursorPower, top: pageY, left: pageX, duration });
  setTimeout(() => {
    const index = popUps.findIndex((p) => p.id === id);
    if (index > -1) popUps.splice(index, 1);
  }, duration);
};
</script>

<template>
  <NuxtLayout>
    <template #left>
      <ClickerStoreHeader pt="4" />
      <ClickerUpgradeList />
    </template>
    <v-container v-if="game" h="full" display="flex" justify="center" items="center" flex="col">
      <ClickerHeader w="full" />
      <div class="text-h3" text="center" font="bold" select="none">{{ game.noPoints }} Piña Coladas</div>
      <ClickerPinaColada mt="12" width="256" height="256" :g-attrs="{ cursor: 'pointer' }" @click="onClick" />
    </v-container>
    <ClickerClickPopup v-for="{ id, ...popUpProps } in popUps" :key="id" :="popUpProps" />
  </NuxtLayout>
</template>
