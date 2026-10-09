<script setup lang="ts">
import type { BannerKind } from "#src/models/BannerKind";
import type { CurrencyCount } from "#src/models/CurrencyCount";
import type { WishPoolCell } from "#src/models/WishPoolCell";
import type { WishPurchase } from "#src/models/WishPurchase";
import type { WishResultCell } from "#src/models/WishResultCell";
import type { WishSet } from "#src/models/WishSet";

interface Props {
  // The way back to the world in the reader's language
  backLabel: string;
  // The banners on offer, in the game's order
  bannerKinds: BannerKind[];
  bannerLabels: Record<BannerKind, string>;
  // The counts the screen shows over its banner
  currencies: CurrencyCount[];
  // The Epitomized Path's Fate Points as the game words them, "" on every banner but the weapon wish's
  fatePoints: string;
  // The Epitomized Path's name, "" on every banner but the weapon wish's
  pathLabel: string;
  // What the open banner can draw, the highest rarity first and the featured first of each rarity
  pool: WishPoolCell[];
  // The Fate bought with Primogems, offered as one button beside the sets while the wallet holds too few Fates for a
  // Wish, "[]" otherwise
  purchases: WishPurchase[];
  // What the last wishes drew, one card each in the order the game shows them, over the screen until a click goes on,
  // None before a wish
  results: WishResultCell[];
  // The open banner's ×1 and ×10
  sets: WishSet[];
  title: string;
}

const bannerKind = defineModel<BannerKind>("bannerKind");
const {
  backLabel,
  bannerKinds,
  bannerLabels,
  currencies,
  fatePoints,
  pathLabel,
  pool,
  purchases,
  results,
  sets,
  title,
} = defineProps<Props>();
const emit = defineEmits<{ buy: []; close: []; dismiss: []; wish: [count: number] }>();
const poolRarityCellsMap = computed(() => Map.groupBy(pool, ({ rarity }) => rarity));
</script>

<template>
  <!-- The wish, the F3 key's: the banners across the head with the counts and the way back beside them, the open banner's
       Pool by rarity, its Epitomized Path on the weapon wish, its ×1 and ×10 with their costs, and over it all what the
       Last wishes drew, a card each with its stars, until a click goes on. Provisional: every place, size and colour here,
       The stars' mark, the banners' art and the falling star wait on the wish's passes against a recording of the English
       Client at 1080 high -->
  <div class="wish-screen">
    <header class="head">
      <p class="title" role="heading" aria-level="1">{{ title }}</p>
      <ul class="banners">
        <li v-for="kind of bannerKinds" :key="kind">
          <button class="banner" :aria-pressed="kind === bannerKind" type="button" @click="bannerKind = kind">
            {{ bannerLabels[kind] }}
          </button>
        </li>
      </ul>
      <ul class="currencies">
        <li v-for="{ id, name, quantity } of currencies" :key="id" class="currency">
          <span class="currency-name">{{ name }}</span>
          {{ quantity }}
        </li>
      </ul>
      <button class="back" type="button" @click="emit('close')">{{ backLabel }}</button>
    </header>
    <ul class="pool">
      <li v-for="[rarity, cells] of poolRarityCellsMap" :key="rarity" class="pool-rarity">
        <span class="stars">{{ "★".repeat(rarity) }}</span>
        <ul class="pool-items">
          <li v-for="{ id, isFeatured, name } of cells" :key="id" class="pool-item" :data-featured="isFeatured">
            {{ name }}
          </li>
        </ul>
      </li>
    </ul>
    <p v-if="pathLabel" class="path">
      {{ pathLabel }}
      <span class="fate-points">{{ fatePoints }}</span>
    </p>
    <div v-if="bannerKind" class="sets">
      <button
        v-for="{ cost, count, isAffordable, label } of sets"
        :key="count"
        class="set"
        :disabled="!isAffordable"
        type="button"
        @click="emit('wish', count)"
      >
        <span class="cost">{{ cost }}</span>
        {{ label }}
      </button>
      <button
        v-for="{ cost, isAffordable, label } of purchases"
        :key="label"
        class="set"
        :disabled="!isAffordable"
        type="button"
        @click="emit('buy')"
      >
        <span class="cost">{{ cost }}</span>
        {{ label }}
      </button>
    </div>
    <div v-if="results.length > 0" class="results" @click="emit('dismiss')">
      <ul class="result-list">
        <li
          v-for="({ isCapturingRadiance, name, rarity, wishReturn }, index) of results"
          :key="index"
          class="result"
          :data-capturing-radiance="isCapturingRadiance"
          :data-rarity="rarity"
        >
          <span class="result-name">{{ name }}</span>
          <span class="stars">{{ "★".repeat(rarity) }}</span>
          <span class="result-return">{{ wishReturn }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.wish-screen {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  gap: calc(var(--unit) * 16);
  padding: calc(var(--unit) * 24) calc(var(--unit) * 48);
  box-sizing: border-box;
  background: rgb(28 32 42 / 0.92);
  color: #ece5d8;
}

.head {
  display: flex;
  align-items: center;
  gap: calc(var(--unit) * 24);
}

.title {
  margin: 0;
  font-size: calc(var(--unit) * 32);
}

.banners,
.currencies,
.pool,
.pool-items,
.result-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.banners {
  display: flex;
  flex: 1;
  justify-content: center;
  gap: calc(var(--unit) * 8);
}

.banner,
.back,
.set {
  padding: calc(var(--unit) * 8) calc(var(--unit) * 14);
  border: none;
  border-radius: calc(var(--unit) * 24);
  background: rgb(255 255 255 / 0.08);
  color: inherit;
  font: inherit;
  font-size: calc(var(--unit) * 18);
}

.banner[aria-pressed="true"] {
  background: #ece5d8;
  color: #3b4255;
}

.currencies {
  display: flex;
  gap: calc(var(--unit) * 16);
  font-size: calc(var(--unit) * 20);
}

.currency-name,
.cost {
  opacity: 0.7;
}

.pool {
  display: flex;
  flex-direction: column;
  gap: calc(var(--unit) * 12);
  font-size: calc(var(--unit) * 18);
}

.pool-rarity {
  display: flex;
  gap: calc(var(--unit) * 16);
}

.pool-items {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--unit) * 4) calc(var(--unit) * 16);
}

.pool-item[data-featured="true"] {
  color: #ffd780;
}

.stars {
  color: #ffcc32;
  white-space: nowrap;
}

.path {
  margin: 0;
  font-size: calc(var(--unit) * 22);
}

.fate-points {
  margin-left: calc(var(--unit) * 12);
  opacity: 0.7;
}

.sets {
  display: flex;
  justify-content: end;
  gap: calc(var(--unit) * 24);
  margin-top: auto;
}

.set {
  display: flex;
  width: calc(var(--unit) * 280);
  flex-direction: column;
  align-items: center;
  gap: calc(var(--unit) * 4);
  background: #ece5d8;
  color: #3b4255;
}

.set:disabled {
  opacity: 0.5;
}

.results {
  position: absolute;
  inset: 0;
  display: grid;
  background: rgb(255 255 255 / 0.92);
  place-items: center;
}

.result-list {
  display: flex;
  gap: calc(var(--unit) * 12);
}

.result {
  display: flex;
  width: calc(var(--unit) * 120);
  height: calc(var(--unit) * 420);
  flex-direction: column;
  justify-content: end;
  border-radius: calc(var(--unit) * 8);
  background: #5180b6;
  color: #ece5d8;
  font-size: calc(var(--unit) * 18);
  text-align: center;
}

.result[data-rarity="4"] {
  background: #8d6fb5;
}

.result[data-rarity="5"] {
  background: #c18b4c;
}

.result-return {
  padding-bottom: calc(var(--unit) * 8);
  font-size: calc(var(--unit) * 14);
}
</style>
