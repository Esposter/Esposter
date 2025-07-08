<script setup lang="ts">
import { Target } from "#shared/models/clicker/data/Target";
import { dayjs } from "#shared/services/dayjs";
import { useClickerStore } from "@/store/clicker";
import { filename } from "pathe/utils";

const clickerStore = useClickerStore();
const { clicker } = storeToRefs(clickerStore);
const amount = computed(() => {
  const cursorBuilding = clicker.value.boughtBuildings.find(({ id }) => id === Target.Cursor);
  return cursorBuilding?.amount ?? 0;
});
const rotatingDivIds = computed(() => Array.from({ length: amount.value }, () => crypto.randomUUID()));

const icon = computed(() => {
  const glob = import.meta.glob<string>("@/assets/clicker/icons/menu/*.png", { eager: true, import: "default" });
  const images = Object.fromEntries(Object.entries(glob).map(([key, value]) => [filename(key), value]));
  return images.Cursor;
});

const animateCursors = (amount: number) => {
  const initialRotationOffsets = Array.from({ length: amount }, (_value, index) => (360 / amount) * index);

  for (let i = 0; i < amount; i++) {
    const rotationOffset = initialRotationOffsets[i];
    const rotatingDivId = rotatingDivIds.value[i];
    const rotatingDiv = document.querySelector(`#${rotatingDivId}`);
    if (!rotatingDiv) continue;

    rotatingDiv.animate(
      [{ transform: `rotate(${rotationOffset}deg)` }, { transform: `rotate(${rotationOffset + 360}deg)` }],
      { duration: dayjs.duration(60, "seconds").asMilliseconds(), iterations: Infinity },
    );
  }
};

const { trigger } = watchTriggerable(
  amount,
  (newAmount) => {
    animateCursors(newAmount);
  },
  // Animate after vue has updated the DOM with new cursors
  { flush: "post" },
);

onMounted(() => {
  trigger();
});
</script>

<template>
  <div v-for="rotatingDivId of rotatingDivIds" :id="rotatingDivId" :key="rotatingDivId" size-50 absolute top-0>
    <v-img absolute select-none rotate-135 width="2rem" height="2rem" :src="icon" :alt="Target.Cursor" />
  </div>
</template>
