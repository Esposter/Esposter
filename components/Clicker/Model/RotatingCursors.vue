<script setup lang="ts">
import { Target } from "@/models/clicker/Target";
import { dayjs } from "@/services/dayjs";
import { useGameStore } from "@/store/clicker/game";
import { filename } from "pathe/utils";

const gameStore = useGameStore();
const { game } = storeToRefs(gameStore);
const amount = computed(() => {
  const cursorBuilding = game.value.boughtBuildings.find((b) => b.name === Target.Cursor);
  return cursorBuilding?.amount ?? 0;
});
const rotatingDivIds = computed(() => Array.from({ length: amount.value }, () => crypto.randomUUID()));

const icon = computed(() => {
  const glob = import.meta.glob("@/assets/clicker/icons/menu/*.png", { eager: true, import: "default" });
  const images = Object.fromEntries(Object.entries(glob).map(([key, value]) => [filename(key), value as string]));
  return images.Cursor;
});

const animateCursors = (amount: number) => {
  const initialRotationOffsets = Array.from({ length: amount }, (_, index) => (360 / amount) * index);

  for (let i = 0; i < amount; i++) {
    const rotationOffset = initialRotationOffsets[i];
    const rotatingDivId = rotatingDivIds.value[i];
    const rotatingDiv = document.getElementById(rotatingDivId);
    if (!rotatingDiv) continue;

    rotatingDiv.animate(
      [{ transform: `rotate(${rotationOffset}deg)` }, { transform: `rotate(${rotationOffset + 360}deg)` }],
      { duration: dayjs.duration(60, "seconds").asMilliseconds(), iterations: Infinity },
    );
  }
};

// Animate after vue has updated the DOM with new cursors
const { trigger } = watchTriggerable(amount, (newValue) => animateCursors(newValue), { flush: "post" });
onMounted(trigger);
</script>

<template>
  <div v-for="rotatingDivId in rotatingDivIds" :id="rotatingDivId" :key="rotatingDivId" w-64 h-64 absolute top-0>
    <v-img absolute rotate-135 width="2rem" height="2rem" :src="icon" :alt="Target.Cursor" />
  </div>
</template>
