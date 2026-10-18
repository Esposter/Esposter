<script setup lang="ts">
import type { BannerKind } from "#src/models/BannerKind";
import type { CurrencyCount } from "#src/models/CurrencyCount";
import type { TextSegment } from "#src/models/TextSegment";
import type { WishBannerCard } from "#src/models/WishBannerCard";
import type { WishPoolCell } from "#src/models/WishPoolCell";
import type { WishPurchase } from "#src/models/WishPurchase";
import type { WishResultCell } from "#src/models/WishResultCell";
import type { WishSet } from "#src/models/WishSet";

import GameButton from "#src/components/GameButton/Index.vue";
import ScreenTitle from "#src/components/ScreenTitle/Index.vue";
import WishDetails from "#src/components/WishDetails/Index.vue";
import WishPath from "#src/components/WishPath/Index.vue";
import { GameButtonKind } from "#src/models/GameButtonKind";
import { computed, ref } from "vue";

interface Props {
  // The way back to the world in the reader's language
  backLabel: string;
  // The open event banner's card, "undefined" on a banner the game gives no card to here
  bannerCard?: WishBannerCard;
  // The banners on offer, in the game's order, each with its id, its kind and its name in the runs of colour the game
  // Words it in
  banners: { id: string; kind: BannerKind; label: TextSegment[] }[];
  // The counts the screen shows over its banner
  currencies: CurrencyCount[];
  // The Details button's words, which open the popup listing the open banner's pool
  detailsLabel: string;
  // The Epitomized Path's Fate Points as the game words and colours them, "[]" on every banner but the weapon wish's
  fatePoints: TextSegment[];
  // The History button's words
  historyLabel: string;
  // The Epitomized Path's name, "" on every banner but the weapon wish's
  pathLabel: string;
  // What the open banner can draw, the highest rarity first and the featured first of each rarity
  pool: WishPoolCell[];
  // The card's notice that the open banner raises a promoted item's chance, in the reader's language
  probabilityLabel: string;
  // The Fate bought with Primogems, offered as one button beside the sets while the wallet holds too few Fates for a
  // Wish, "[]" otherwise
  purchases: WishPurchase[];
  // What the last wishes drew, one card each in the order the game shows them, over the screen until a click goes on,
  // None before a wish
  results: WishResultCell[];
  // The open banner's ×1 and ×10
  sets: WishSet[];
  // The Shop button's words
  shopLabel: string;
  title: string;
}

const bannerId = defineModel<string>("bannerId");
const {
  backLabel,
  banners,
  bannerCard,
  currencies,
  detailsLabel,
  fatePoints,
  historyLabel,
  pathLabel,
  pool,
  probabilityLabel,
  purchases,
  results,
  sets,
  shopLabel,
  title,
} = defineProps<Props>();
const emit = defineEmits<{ buy: []; close: []; dismiss: []; wish: [count: number] }>();
// The Details popup the Details button opens over the screen
const isDetailsOpen = ref(false);
const featuredCell = computed(() => pool.find(({ isFeatured, rarity }) => isFeatured && rarity === 5));
const getLabelText = (label: TextSegment[]) => label.map(({ text }) => text).join("");
const bannerLabelText = computed(() => {
  const openBanner = banners.find(({ id }) => id === bannerId.value);
  return openBanner && getLabelText(openBanner.label);
});
</script>

<template>
  <!-- The wish, the F3 key's: the banners across the head with the counts and the way back beside them, the open banner's
       card over the screen with its promoted five-star, its ×1 and ×10 with their costs, and the Shop, Details and History
       Row under the card. Details opens the banner's pool over the screen, and over it all what the Last wishes drew, a card
       Each with its stars, until a click goes on. Provisional: every place, size and colour here waits on the wish's passes
       Against a recording of the English Client at 1080 high, and the banner card's art and the banners' tabs' portraits
       Are the plate's, which cannot ship -->
  <div class="wish-screen">
    <ScreenTitle role="heading" aria-level="1">{{ title }}</ScreenTitle>
    <ul class="banners">
      <li v-for="banner of banners" :key="banner.id">
        <GameButton
          class="banner"
          :aria-label="getLabelText(banner.label)"
          :aria-pressed="banner.id === bannerId"
          :kind="GameButtonKind.Row"
          @click="bannerId = banner.id"
        />
      </li>
    </ul>
    <ul class="currencies">
      <li v-for="{ id, name, quantity } of currencies" :key="id" class="currency">
        <span class="currency-name">{{ name }}</span>
        {{ quantity }}
      </li>
    </ul>
    <GameButton class="back" :aria-label="backLabel" :kind="GameButtonKind.Plain" @click="emit('close')">✕</GameButton>
    <section v-if="bannerCard && bannerLabelText" class="card">
      <p class="tag">{{ bannerLabelText }}</p>
      <p class="card-title">
        <span v-for="({ color, text }, index) of bannerCard.title" :key="index" :style="{ color }">{{ text }}</span>
      </p>
      <p class="probability">{{ probabilityLabel }}</p>
      <p class="rate-up">{{ bannerCard.rateUp }}</p>
      <div v-if="featuredCell" class="featured">
        <p class="featured-name">{{ featuredCell.name }}</p>
        <p class="stars">{{ "★".repeat(featuredCell.rarity) }}</p>
        <p class="featured-title">{{ bannerCard.featuredTitle }}</p>
      </div>
    </section>
    <div class="links">
      <GameButton class="link" :kind="GameButtonKind.Reply">{{ shopLabel }}</GameButton>
      <GameButton class="link" :kind="GameButtonKind.Reply" @click="isDetailsOpen = true">{{
        detailsLabel
      }}</GameButton>
      <GameButton class="link" :kind="GameButtonKind.Reply">{{ historyLabel }}</GameButton>
    </div>
    <WishPath v-if="pathLabel" class="path" :path-label :fate-points />
    <div v-if="bannerId" class="sets">
      <GameButton
        v-for="{ cost, count, isAffordable, label } of sets"
        :key="count"
        class="set"
        :disabled="!isAffordable"
        :kind="GameButtonKind.Pill"
        @click="emit('wish', count)"
      >
        <span class="set-label">{{ label }}</span>
        <span class="cost">{{ cost }}</span>
      </GameButton>
      <GameButton
        v-for="{ cost, isAffordable, label } of purchases"
        :key="label"
        class="set"
        :disabled="!isAffordable"
        :kind="GameButtonKind.Pill"
        @click="emit('buy')"
      >
        <span class="set-label">{{ label }}</span>
        <span class="cost">{{ cost }}</span>
      </GameButton>
    </div>
    <WishDetails
      v-if="isDetailsOpen"
      :close-label="backLabel"
      :fate-points
      :path-label
      :pool
      :title="detailsLabel"
      @close="isDetailsOpen = false"
    />
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
  background: rgb(28 32 42 / 0.92);
  color: #fff;
}

.banners,
.currencies,
.links,
.result-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.banners {
  position: absolute;
  top: 0;
  left: calc(var(--unit) * 678);
  display: flex;
  gap: calc(var(--unit) * 27);
}

.banner {
  width: calc(var(--unit) * 172);
  height: calc(var(--unit) * 92);
  border: calc(var(--unit) * 2) solid rgb(255 255 255 / 0.6);
}

.banner[aria-pressed="true"] {
  background: rgb(253 247 242 / 0.85);
}

.currencies {
  position: absolute;
  top: calc(var(--unit) * 30);
  left: calc(var(--unit) * 1440);
  display: flex;
  gap: calc(var(--unit) * 24);
  font-size: calc(var(--unit) * 20);
}

.currency-name {
  opacity: 0.7;
}

.back {
  position: absolute;
  top: calc(var(--unit) * 17);
  left: calc(var(--unit) * 1812);
  width: calc(var(--unit) * 56);
  height: calc(var(--unit) * 56);
  font-size: calc(var(--unit) * 36);
}

/* The card is the plate's art, so only its words are drawn over it, each at the game's place on the banner */
.card {
  position: absolute;
  inset: 0;
}

.tag {
  position: absolute;
  top: calc(var(--unit) * 213);
  left: calc(var(--unit) * 322);
  margin: 0;
  padding: calc(var(--unit) * 4) calc(var(--unit) * 16);
  border-radius: calc(var(--unit) * 18);
  background: rgb(62 195 238);
  font-size: calc(var(--unit) * 22);
}

.card-title {
  position: absolute;
  top: calc(var(--unit) * 250);
  left: calc(var(--unit) * 377);
  margin: 0;
  color: #3e3c3d;
  font-size: calc(var(--unit) * 58);
  line-height: calc(var(--unit) * 72);
}

.probability {
  position: absolute;
  top: calc(var(--unit) * 455);
  left: calc(var(--unit) * 377);
  margin: 0;
  color: #3e3c3d;
  font-size: calc(var(--unit) * 26);
}

.rate-up {
  position: absolute;
  top: calc(var(--unit) * 500);
  left: calc(var(--unit) * 377);
  width: calc(var(--unit) * 462);
  box-sizing: border-box;
  margin: 0;
  padding: calc(var(--unit) * 10) calc(var(--unit) * 36);
  background: rgb(62 195 238);
  font-size: calc(var(--unit) * 20);
}

.featured {
  position: absolute;
  top: calc(var(--unit) * 672);
  left: calc(var(--unit) * 1068);
}

.featured-name {
  margin: 0;
  font-size: calc(var(--unit) * 40);
}

.featured-title {
  width: calc(var(--unit) * 348);
  box-sizing: border-box;
  margin: calc(var(--unit) * 4) 0 0;
  padding: 0 calc(var(--unit) * 12);
  background: rgb(20 30 50 / 0.7);
  font-size: calc(var(--unit) * 22);
}

.stars {
  color: #ffcc32;
  white-space: nowrap;
}

.links {
  position: absolute;
  top: calc(var(--unit) * 1010);
  left: calc(var(--unit) * 68);
  display: flex;
  gap: calc(var(--unit) * 20);
}

.link {
  width: calc(var(--unit) * 172);
  height: calc(var(--unit) * 32);
  font-size: calc(var(--unit) * 22);
}

.path {
  position: absolute;
  top: calc(var(--unit) * 940);
  left: calc(var(--unit) * 68);
}

.sets {
  position: absolute;
  top: calc(var(--unit) * 975);
  left: calc(var(--unit) * 1147);
  display: flex;
  gap: calc(var(--unit) * 33);
}

.set {
  display: flex;
  width: calc(var(--unit) * 340);
  height: calc(var(--unit) * 72);
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #3b4255;
  font-size: calc(var(--unit) * 22);
}

.set-label {
  font-weight: 600;
}

.cost {
  font-size: calc(var(--unit) * 18);
  opacity: 0.7;
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
