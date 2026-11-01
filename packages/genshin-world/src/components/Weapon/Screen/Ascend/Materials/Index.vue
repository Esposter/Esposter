<script setup lang="ts">
import type { WeaponAscendCost } from "#src/models/weapon/WeaponAscendCost";
import type { GameText } from "genshin-text";

import { GameTextKey } from "genshin-text";

interface Props {
  // The materials the next phase takes, each with its name, rarity, the count it takes and the count the bag holds
  costs: WeaponAscendCost[];
  // The game's words in the reader's language, which the materials' title is set in
  gameText: GameText;
}

const { costs, gameText } = defineProps<Props>();
</script>

<template>
  <p class="materials-title">{{ gameText[GameTextKey.CombineTypeWeaponAscension] }}</p>
  <div class="cards">
    <div v-for="cost of costs" :key="cost.id" class="card" :data-rarity="cost.rarity">
      <span class="card-name">{{ cost.name }}</span>
      <span class="card-stars" aria-hidden="true"><span v-for="star in cost.rarity" :key="star" class="star" /></span>
      <span class="card-count">{{ cost.ownedCount }} / {{ cost.count }}</span>
    </div>
  </div>
</template>

<style scoped>
.materials-title {
  position: absolute;
  top: calc(var(--reference-pixel) * 548);
  left: calc(var(--reference-pixel) * 1276);
  margin: 0;
  color: #dcc58e;
  font-size: calc(var(--reference-pixel) * 28);
  font-weight: 600;
  line-height: 1;
}

/* Ascend's materials: a card per ingredient, its art over a rarity's tint and its count on a cream band */
.cards {
  position: absolute;
  top: calc(var(--reference-pixel) * 597);
  left: calc(var(--reference-pixel) * 1282);
  display: flex;
  gap: calc(var(--reference-pixel) * 19.25);
}

.card {
  position: relative;
  width: calc(var(--reference-pixel) * 100);
  height: calc(var(--reference-pixel) * 121);
  overflow: hidden;
  border-radius: calc(var(--reference-pixel) * 6);
  background: linear-gradient(#52706f, #467f71 80%, #ede6e3 80%);
}

.card[data-rarity="1"] {
  background: linear-gradient(#5f6069, #6e6c75 80%, #ede6e3 80%);
}

.card-name {
  position: absolute;
  color: transparent;
  font-size: 1px;
}

.card-count {
  position: absolute;
  top: calc(var(--reference-pixel) * 98);
  right: 0;
  left: 0;
  height: calc(var(--reference-pixel) * 23);
  color: #3d3c44;
  font-size: calc(var(--reference-pixel) * 17);
  font-weight: 600;
  line-height: calc(var(--reference-pixel) * 23);
  text-align: center;
}

/* A card's rarity: its gold stars, centred over the art above its count band */
.card-stars {
  position: absolute;
  top: calc(var(--reference-pixel) * 87);
  right: 0;
  left: 0;
  display: flex;
  justify-content: center;
  gap: calc(var(--reference-pixel) * 2);
}

.star {
  width: calc(var(--reference-pixel) * 13);
  height: calc(var(--reference-pixel) * 13);
  background: #f5c24a;
  clip-path: polygon(50% 0, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
}
</style>
