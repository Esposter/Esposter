<script setup lang="ts">
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
import ScreenTitle from "#src/components/ScreenTitle/Index.vue";
import WishDetails from "#src/components/Wish/Details/Index.vue";
import WishHistory from "#src/components/Wish/History/Index.vue";
import WishPath from "#src/components/Wish/Path/Index.vue";
import Card from "#src/components/Wish/Screen/Card/Index.vue";
import Currencies from "#src/components/Wish/Screen/Currencies/Index.vue";
import Results from "#src/components/Wish/Screen/Results/Index.vue";
import Sets from "#src/components/Wish/Screen/Sets/Index.vue";
import { CloseButtonMark } from "#src/models/CloseButtonMark";
import { GameButtonKind } from "#src/models/GameButtonKind";

interface Props {
  // The way back to the world in the reader's language
  backLabel: string;
  // The open event banner's card, "undefined" on a banner the game gives no card to here
  bannerCard?: WishBannerCard;
  // The banners on offer, in the game's order, each with its id and its name in the runs of colour the game
  // Words it in
  banners: { id: string; label: TextSegment[] }[];
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
const emit = defineEmits<{ buy: []; close: []; dismiss: []; startTrial: []; wish: [count: number] }>();
// The Details popup the Details button opens over the screen
const isDetailsOpen = ref(false);
const isHistoryOpen = ref(false);
const getLabelText = (label: TextSegment[]) => label.map(({ text }) => text).join("");
// Each banner's words as one string, read by its tab's name and, for the open one, by the card's tag
const bannerLabels = computed(() => banners.map(({ id, label }) => ({ id, labelText: getLabelText(label) })));
const bannerLabelText = computed(() => bannerLabels.value.find(({ id }) => id === bannerId.value)?.labelText);
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
      <li v-for="{ id, labelText } of bannerLabels" :key="id">
        <GameButton
          class="banner"
          :aria-label="labelText"
          :aria-pressed="id === bannerId"
          :kind="GameButtonKind.Row"
          tip=""
          @click="bannerId = id"
        />
      </li>
    </ul>
    <Currencies :currencies />
    <CloseButton class="close" :label="backLabel" :mark="CloseButtonMark.Cross" @click="emit('close')" />
    <Card
      v-if="bannerLabelText && fiveStarNotice"
      :banner-card="bannerCard"
      :banner-label="bannerLabelText"
      :five-star-notice="fiveStarNotice"
      :pool
      :probability-label="probabilityLabel"
      :time-remaining-label="timeRemainingLabel"
      :time-remaining-text="timeRemainingText"
    />
    <div class="links">
      <GameButton class="link" :kind="GameButtonKind.Reply" tip="">{{ shopLabel }}</GameButton>
      <GameButton
        v-if="trialLabel"
        class="link trial"
        :kind="GameButtonKind.Reply"
        tip=""
        @click="emit('startTrial')"
        >{{ trialLabel }}</GameButton
      >
      <GameButton class="link" :kind="GameButtonKind.Reply" tip="" @click="isDetailsOpen = true">{{
        detailsLabel
      }}</GameButton>
      <GameButton class="link" :kind="GameButtonKind.Reply" tip="" @click="isHistoryOpen = true">{{
        historyLabel
      }}</GameButton>
    </div>
    <WishPath v-if="pathLabel" class="path" :path-label :fate-points />
    <Sets v-if="bannerId" :purchases :sets @buy="emit('buy')" @wish="(count) => emit('wish', count)" />
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
    <Results v-if="results.length > 0" :results @dismiss="emit('dismiss')" />
  </div>
</template>

<style scoped src="../../../styles/sparkle.css"></style>

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
.links {
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

.close {
  background: #f2f2f4;
  color: #343744;
}

.star {
  top: calc(var(--unit) * 22);
  left: calc(var(--unit) * 53);
  width: calc(var(--unit) * 49);
  height: calc(var(--unit) * 47);
  background: #e5ca95;
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
</style>
