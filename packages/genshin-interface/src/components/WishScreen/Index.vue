<script setup lang="ts">
import type { BannerKind } from "#src/models/BannerKind";
import type { CurrencyCount } from "#src/models/CurrencyCount";
import type { TextSegment } from "#src/models/TextSegment";
import type { WishBannerCard } from "#src/models/WishBannerCard";
import type { WishHistoryCell } from "#src/models/WishHistoryCell";
import type { WishPoolCell } from "#src/models/WishPoolCell";
import type { WishPurchase } from "#src/models/WishPurchase";
import type { WishResultCell } from "#src/models/WishResultCell";
import type { WishSet } from "#src/models/WishSet";

import CloseButton from "#src/components/CloseButton/Index.vue";
import GameButton from "#src/components/GameButton/Index.vue";
import RarityStars from "#src/components/RarityStars/Index.vue";
import ScreenTitle from "#src/components/ScreenTitle/Index.vue";
import WishDetails from "#src/components/WishDetails/Index.vue";
import WishHistory from "#src/components/WishHistory/Index.vue";
import WishPath from "#src/components/WishPath/Index.vue";
import { CloseButtonMark } from "#src/models/CloseButtonMark";
import { GameButtonKind } from "#src/models/GameButtonKind";

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
  // The five-star notice the open event banner's card gives, in the reader's language, "" on a banner with no card
  fiveStarNotice: string;
  // The draws the History popup lists, the newest first
  history: WishHistoryCell[];
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
  // The Time Remaining label, shown over the time left and only with it
  timeRemainingLabel: string;
  // The time the open event banner has left in its window, in the game's words, "" on a banner with no window
  timeRemainingText: string;
  title: string;
  // The trial button's words in the reader's language, "" on a banner with no trial
  trialLabel: string;
}

const bannerId = defineModel<string>("bannerId", { default: "" });
const {
  backLabel,
  bannerCard,
  banners,
  currencies,
  detailsLabel,
  fatePoints,
  fiveStarNotice,
  history,
  historyLabel,
  pathLabel,
  pool,
  probabilityLabel,
  purchases,
  results,
  sets,
  shopLabel,
  timeRemainingLabel,
  timeRemainingText,
  title,
  trialLabel,
} = defineProps<Props>();
const emit = defineEmits<{ buy: []; close: []; dismiss: []; trial: []; wish: [count: number] }>();
// The Details popup the Details button opens over the screen
const isDetailsOpen = ref(false);
const isHistoryOpen = ref(false);
const featuredCell = computed(() => pool.find(({ isFeatured, rarity }) => isFeatured && rarity === 5));
const getLabelText = (label: TextSegment[]) => label.map(({ text }) => text).join("");
const bannerLabelText = computed(() => {
  const openBanner = banners.find(({ id }) => id === bannerId.value);
  return openBanner && getLabelText(openBanner.label);
});
const topUpCurrencies = computed(() => currencies.filter(({ isTopUp }) => isTopUp));
const bottomCurrencies = computed(() => currencies.filter(({ isTopUp }) => !isTopUp));
</script>

<template>
  <!-- The wish, the F3 key's: the banners across the head with the counts and the way back beside them, the open banner's
       card over the screen with its promoted five-star, its ×1 and ×10 with their costs, and the Shop, Details and History
       row under the card. Details opens the banner's pool over the screen, and over it all what the Last wishes drew, a card
       each with its stars, until a click goes on. Provisional: every place, size and colour here waits on the wish's passes
       against a recording of the English Client at 1080 high, and the banner card's art and the banners' tabs' portraits
       are the plate's, which cannot ship -->
  <div class="wish-screen">
    <span class="sparkle star" aria-hidden="true" />
    <ScreenTitle class="heading" role="heading" aria-level="1">{{ title }}</ScreenTitle>
    <ul class="banners">
      <li v-for="banner of banners" :key="banner.id">
        <GameButton
          class="banner"
          :aria-label="getLabelText(banner.label)"
          :aria-pressed="banner.id === bannerId"
          :kind="GameButtonKind.Row"
          tip=""
          @click="bannerId = banner.id"
        />
      </li>
    </ul>
    <ul class="currencies currencies-top">
      <li v-for="{ id, name, quantity } of topUpCurrencies" :key="id" class="currency">
        <span class="currency-icon" role="img" :aria-label="name" />
        <span class="currency-count">{{ quantity }}</span>
        <span class="top-up" aria-hidden="true">+</span>
      </li>
    </ul>
    <ul class="currencies currencies-bottom">
      <li v-for="{ id, name, quantity } of bottomCurrencies" :key="id" class="currency">
        <span class="currency-icon" role="img" :aria-label="name" />
        <span class="currency-count">{{ quantity }}</span>
      </li>
    </ul>
    <CloseButton class="close" :label="backLabel" :mark="CloseButtonMark.Cross" @click="emit('close')" />
    <section v-if="bannerLabelText && fiveStarNotice" class="card">
      <p class="tag">{{ bannerLabelText }}</p>
      <p v-if="bannerCard" class="card-title">
        <span v-for="({ color, text }, index) of bannerCard.title" :key="index" :style="{ color }">{{ text }}</span>
      </p>
      <span v-if="bannerCard" class="rule" aria-hidden="true" />
      <p class="probability">{{ probabilityLabel }}</p>
      <p v-if="bannerCard" class="rate-up"><span class="sparkle small" aria-hidden="true" />{{ bannerCard.rateUp }}</p>
      <p class="notice">{{ fiveStarNotice }}</p>
      <p v-if="timeRemainingText" class="time-label">{{ timeRemainingLabel }}</p>
      <p v-if="timeRemainingText" class="time-duration">{{ timeRemainingText }}</p>
      <div v-if="bannerCard && featuredCell" class="featured">
        <p class="featured-name">{{ featuredCell.name }}</p>
        <p class="featured-stars"><RarityStars :rarity="featuredCell.rarity" /></p>
        <p class="featured-title">{{ bannerCard.featuredTitle }}</p>
      </div>
    </section>
    <div class="links">
      <GameButton class="link" :kind="GameButtonKind.Reply" tip="">{{ shopLabel }}</GameButton>
      <GameButton v-if="trialLabel" class="link trial" :kind="GameButtonKind.Reply" tip="" @click="emit('trial')">{{
        trialLabel
      }}</GameButton>
      <GameButton class="link" :kind="GameButtonKind.Reply" tip="" @click="isDetailsOpen = true">{{
        detailsLabel
      }}</GameButton>
      <GameButton class="link" :kind="GameButtonKind.Reply" tip="" @click="isHistoryOpen = true">{{
        historyLabel
      }}</GameButton>
    </div>
    <WishPath v-if="pathLabel" class="path" :path-label :fate-points />
    <div v-if="bannerId" class="sets">
      <GameButton
        v-for="{ cost, count, isAffordable, label } of sets"
        :key="count"
        class="set"
        :disabled="!isAffordable"
        :kind="GameButtonKind.Pill"
        tip=""
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
        tip=""
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
    <WishHistory
      v-if="isHistoryOpen"
      :close-label="backLabel"
      :history
      :title="historyLabel"
      @close="isHistoryOpen = false"
    />
    <div v-if="results.length > 0" class="results" @click="emit('dismiss')">
      <ul class="result-list">
        <li
          v-for="({ isCapturingRadiance, name, rarity, stellaFortuna, wishReturn }, index) of results"
          :key="index"
          class="result"
          :data-capturing-radiance="isCapturingRadiance"
          :data-rarity="rarity"
        >
          <span class="result-name">{{ name }}</span>
          <RarityStars :rarity />
          <span v-if="stellaFortuna" class="result-stella-fortuna">{{ stellaFortuna }}</span>
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
  color: #fff;
}

.heading {
  font-size: calc(var(--unit) * 24);
  letter-spacing: calc(var(--unit) * 2.7);
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
  top: calc(var(--unit) * 28);
  left: calc(var(--unit) * 668);
  display: flex;
  align-items: center;
}

/* The tabs are a fixed pitch of 194, so the open one's extra width grows from its centre and the others keep their places */
.banners li {
  display: flex;
  width: calc(var(--unit) * 194);
  justify-content: center;
}

.banner {
  width: calc(var(--unit) * 157);
  height: calc(var(--unit) * 58);
  border: calc(var(--unit) * 2) solid rgb(255 255 255 / 0.25);
  background: rgb(84 120 172 / 0.9);
}

.banner[aria-pressed="true"] {
  width: calc(var(--unit) * 175);
  height: calc(var(--unit) * 66);
  background: #fffdea;
}

/* The top-up currency sits in a translucent pill with its own plus, the banner's Fates below at the foot, each a count beside
   its icon. The icons are the game's own art, which cannot ship, so each is a placeholder of its size */
.currencies {
  position: absolute;
  display: flex;
  align-items: center;
  font-size: calc(var(--unit) * 28);
  font-weight: 700;
}

.currencies-top {
  top: calc(var(--unit) * 27);
  left: calc(var(--unit) * 1487);
}

.currencies-bottom {
  top: calc(var(--unit) * 958);
  left: calc(var(--unit) * 68);
  gap: calc(var(--unit) * 47);
}

.currency {
  display: flex;
  height: calc(var(--unit) * 36);
  align-items: center;
  gap: calc(var(--unit) * 15);
}

.currencies-top .currency {
  padding: 0 calc(var(--unit) * 2) 0 calc(var(--unit) * 13);
  border-radius: calc(var(--unit) * 18);
  background: rgb(40 52 68 / 0.55);
}

.currency-icon {
  width: calc(var(--unit) * 26);
  height: calc(var(--unit) * 26);
}

.top-up {
  display: flex;
  width: calc(var(--unit) * 31);
  height: calc(var(--unit) * 31);
  margin-left: calc(var(--unit) * 14);
  border-radius: 50%;
  background: #fff;
  color: #343744;
  font-size: calc(var(--unit) * 26);
  align-items: center;
  justify-content: center;
}

.close {
  background: #f2f2f4;
  color: #343744;
}

/* The sparkle the game marks its Wish and its banner's rate-up with, a four-point star in its own colour */
.sparkle {
  position: absolute;
  clip-path: var(--sparkle-clip-path);
}

.star {
  top: calc(var(--unit) * 22);
  left: calc(var(--unit) * 53);
  width: calc(var(--unit) * 49);
  height: calc(var(--unit) * 47);
  background: #e5ca95;
}

.sparkle.small {
  top: calc(var(--unit) * 38);
  left: calc(var(--unit) * 13);
  width: calc(var(--unit) * 13);
  height: calc(var(--unit) * 14);
  background: #fff;
}

/* The faint dotted rule the game draws under the card's title */
.rule {
  position: absolute;
  top: calc(var(--unit) * 413);
  left: calc(var(--unit) * 380);
  width: calc(var(--unit) * 440);
  border-top: calc(var(--unit) * 2) dotted #d6dce4;
}

/* The card's art is the plate's and cannot ship, so the card is a measured panel of the reference's light field behind the
   words its text column sits on, and its words are drawn over that, each at the game's place on the banner */
.card {
  position: absolute;
  inset: 0;
}

.card::before,
.card::after {
  content: "";
  position: absolute;
  top: calc(var(--unit) * 215);
  left: calc(var(--unit) * 322);
  width: calc(var(--unit) * 508);
  height: calc(var(--unit) * 672);
  background: #fffdfd;
}

.card::after {
  top: calc(var(--unit) * 453);
  left: calc(var(--unit) * 338);
  width: calc(var(--unit) * 6);
  height: calc(var(--unit) * 292);
  background: #524c50;
}

.tag {
  position: absolute;
  top: calc(var(--unit) * 213);
  left: calc(var(--unit) * 316);
  margin: 0;
  padding: calc(var(--unit) * 2) calc(var(--unit) * 12);
  border-radius: calc(var(--unit) * 18);
  background: rgb(62 195 238);
  font-size: calc(var(--unit) * 28);
  letter-spacing: calc(var(--unit) * 0.4);
  line-height: calc(var(--unit) * 33);
}

.card-title {
  position: absolute;
  top: calc(var(--unit) * 243);
  left: calc(var(--unit) * 374);
  width: calc(var(--unit) * 450);
  margin: 0;
  color: #3e3c3d;
  font-size: calc(var(--unit) * 63);
  letter-spacing: calc(var(--unit) * 4.5);
  line-height: calc(var(--unit) * 74);
}

.probability {
  position: absolute;
  top: calc(var(--unit) * 451);
  left: calc(var(--unit) * 377);
  margin: 0;
  color: #3e3c3d;
  font-size: calc(var(--unit) * 36);
  letter-spacing: calc(var(--unit) * 0.9);
  line-height: calc(var(--unit) * 36);
}

.rate-up {
  position: absolute;
  top: calc(var(--unit) * 500);
  left: calc(var(--unit) * 377);
  width: calc(var(--unit) * 465);
  box-sizing: border-box;
  margin: 0;
  padding: calc(var(--unit) * 3) calc(var(--unit) * 20) 0 calc(var(--unit) * 39);
  background: rgb(62 195 238);
  font-size: calc(var(--unit) * 28);
  letter-spacing: calc(var(--unit) * 0.15);
  line-height: calc(var(--unit) * 28.5);
}

.notice {
  position: absolute;
  top: calc(var(--unit) * 601);
  left: calc(var(--unit) * 377);
  width: calc(var(--unit) * 465);
  margin: 0;
  color: #3e3c3d;
  font-size: calc(var(--unit) * 26);
  letter-spacing: calc(var(--unit) * 1.6);
  line-height: calc(var(--unit) * 28.8);
}

.time-label,
.time-duration {
  position: absolute;
  left: calc(var(--unit) * 380);
  margin: 0;
  color: #3e3c3d;
  font-size: calc(var(--unit) * 26);
  line-height: calc(var(--unit) * 28);
}

.time-label {
  top: calc(var(--unit) * 771);
  font-weight: 600;
  letter-spacing: calc(var(--unit) * 1.45);
}

.time-duration {
  top: calc(var(--unit) * 810);
  letter-spacing: calc(var(--unit) * 0.8);
}

.featured {
  position: absolute;
  top: calc(var(--unit) * 672);
  left: calc(var(--unit) * 1068);
}

.featured-name {
  margin: calc(var(--unit) * 5) 0 0;
  font-size: calc(var(--unit) * 56);
  line-height: calc(var(--unit) * 56);
  letter-spacing: calc(var(--unit) * 4);
}

.featured-stars {
  margin: calc(var(--unit) * 7) 0 0;
  font-size: calc(var(--unit) * 22);
  line-height: calc(var(--unit) * 24);
  letter-spacing: calc(var(--unit) * 4);
}

.featured-title {
  width: calc(var(--unit) * 356);
  box-sizing: border-box;
  margin: calc(var(--unit) * 3) 0 0 calc(var(--unit) * -7);
  padding: 0 calc(var(--unit) * 19);
  background: rgb(20 30 50 / 0.7);
  color: #dfc896;
  font-size: calc(var(--unit) * 26);
  line-height: calc(var(--unit) * 29);
}

.links {
  position: absolute;
  top: calc(var(--unit) * 1010);
  left: calc(var(--unit) * 68);
  display: flex;
  gap: calc(var(--unit) * 20);
}

.links .link {
  box-sizing: border-box;
  width: calc(var(--unit) * 172);
  height: calc(var(--unit) * 42);
  background: #f6f0e9;
  color: #36323a;
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

.sets .set {
  display: flex;
  width: calc(var(--unit) * 340);
  height: calc(var(--unit) * 74);
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: calc(var(--unit) * 3) solid #f4f0cb;
  border-radius: calc(var(--unit) * 36);
  background: #fff;
  color: #9d9a9a;
  font-size: calc(var(--unit) * 22);
}

.set-label {
  font-weight: 600;
}

.cost {
  font-size: calc(var(--unit) * 24);
  opacity: 0.85;
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

.result-stella-fortuna {
  font-size: calc(var(--unit) * 14);
}

.result-return {
  padding-bottom: calc(var(--unit) * 8);
  font-size: calc(var(--unit) * 14);
}
</style>
