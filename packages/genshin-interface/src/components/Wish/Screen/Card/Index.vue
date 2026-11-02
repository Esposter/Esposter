<script setup lang="ts">
import type { WishBannerCard } from "#src/models/WishBannerCard";
import type { WishPoolCell } from "#src/models/WishPoolCell";

import RarityStars from "#src/components/RarityStars/Index.vue";

interface Props {
  // The open event banner's card, "undefined" on a banner the game gives no card to here
  bannerCard?: WishBannerCard;
  // The open banner's name in the reader's language, the tag over the card's title
  bannerLabel: string;
  // The five-star notice the open event banner's card gives, in the reader's language
  fiveStarNotice: string;
  // What the open banner can draw, the highest rarity first and the featured first of each rarity
  pool: WishPoolCell[];
  // The card's notice that the open banner raises a promoted item's chance, in the reader's language
  probabilityLabel: string;
  // The Time Remaining label, shown over the time left and only with it
  timeRemainingLabel: string;
  // The time the open event banner has left in its window, in the game's words, "" on a banner with no window
  timeRemainingText: string;
}

const { bannerCard, bannerLabel, fiveStarNotice, pool, probabilityLabel, timeRemainingLabel, timeRemainingText } =
  defineProps<Props>();
const featuredCell = computed(() => pool.find(({ isFeatured, rarity }) => isFeatured && rarity === 5));
</script>

<template>
  <section class="card">
    <p class="tag">{{ bannerLabel }}</p>
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
      <p class="featured-stars"><RarityStars color="" :rarity="featuredCell.rarity" /></p>
      <p class="featured-title">{{ bannerCard.featuredTitle }}</p>
    </div>
  </section>
</template>

<style scoped src="../../../../styles/sparkle.css"></style>

<style scoped>
/* The sparkle the rate-up's line draws, a small one in white */
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
   words its text column sits on, and its words are drawn over that, each at the game's place on the banner. It holds no
   Control and covers the screen, so it takes no pointer from the banners' tabs and the close button under it */
.card {
  position: absolute;
  inset: 0;
  pointer-events: none;
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
  left: calc(var(--unit) * 337);
  width: calc(var(--unit) * 7);
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
  background: rgb(44 180 238);
  font-size: calc(var(--unit) * 28);
  letter-spacing: calc(var(--unit) * 0.4);
  line-height: calc(var(--unit) * 33);
}

.card-title {
  position: absolute;
  top: calc(var(--unit) * 248);
  left: calc(var(--unit) * 374);
  width: calc(var(--unit) * 450);
  margin: 0;
  color: #3e3c3d;
  font-size: calc(var(--unit) * 63);
  letter-spacing: calc(var(--unit) * 4.5);
  line-height: calc(var(--unit) * 71);
}

.probability {
  position: absolute;
  top: calc(var(--unit) * 454);
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
  top: calc(var(--unit) * 602);
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
  background: rgb(18 16 46 / 0.8);
  color: #dfc896;
  font-size: calc(var(--unit) * 26);
  line-height: calc(var(--unit) * 29);
}
</style>
