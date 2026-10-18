<script setup lang="ts">
import type { ReputationLevelCell } from "#src/models/ReputationLevelCell";
import type { TextSegment } from "#src/models/TextSegment";

import ItemTile from "#src/components/ItemTile/Index.vue";
import { CHECK_MARK_PATH } from "#src/services/constants";

interface Props {
  // The achieved mark's words in the reader's language, read to assistive technology in place of the mark
  achievedLabel: string;
  // The way back to the world in the reader's language
  backLabel: string;
  // The picked level's reward, named as the game names it
  headline: string;
  // The badge's word over each level's number, "Lv." in English
  levelLabel: string;
  // The levels in the game's order, each a row the picked one is drawn over
  levels: ReputationLevelCell[];
  // The words a level the nation's Reputation has not reached shows in place of the achieved mark
  notAchievedLabel: string;
  // The request the keeper offers, its title and the button that takes it in the reader's language, or none where she
  // Offers none
  offer?: { acceptLabel: string; title: string };
  // The picked level's requirement, its coloured runs as the game words them, "[]" where the screen names none
  requirement: TextSegment[];
  // The title the game shows over the page, its nation's name filled in
  title: string;
}

const level = defineModel<number>("level", { default: 0 });
const { achievedLabel, backLabel, headline, levelLabel, levels, notAchievedLabel, offer, requirement, title } =
  defineProps<Props>();
const emit = defineEmits<{ accept: []; close: [] }>();
</script>

<template>
  <!-- The Reputation reward page, the nation's keeper opens: its title across the head with the way back, the picked
       level's reward and requirement on the left, and the levels down the right. Each row is the public clip's at 1080
       high (references/reputation-screen): its level on a pentagon badge, its items in slots coloured by rarity with
       their count beneath, its unlock line behind an info mark, and the tick or the not achieved block at its end. The
       head and the left column are still provisional: the reference frames only the level list -->
  <div class="reputation-screen">
    <header class="head">
      <p class="title" role="heading" aria-level="1">{{ title }}</p>
      <button class="back" :aria-label="backLabel" type="button" @click="emit('close')">↶</button>
    </header>
    <section class="detail">
      <p class="headline">{{ headline }}</p>
      <p class="requirement">
        <span v-for="({ color, text }, index) of requirement" :key="index" :style="{ color }">{{ text }}</span>
      </p>
    </section>
    <section v-if="offer" class="offer">
      <p class="offer-title">{{ offer.title }}</p>
      <button class="accept" type="button" @click="emit('accept')">{{ offer.acceptLabel }}</button>
    </section>
    <ul class="levels">
      <li v-for="cell of levels" :key="cell.level">
        <button
          class="level"
          :aria-pressed="cell.level === level"
          :data-achieved="cell.isAchieved || undefined"
          type="button"
          @click="level = cell.level"
        >
          <span class="badge">
            <span class="badge-face">
              <span class="badge-word">{{ levelLabel }}</span>
              <span class="badge-number">{{ cell.level }}</span>
            </span>
          </span>
          <span class="items">
            <ItemTile
              v-for="({ count, label, rarity }, index) of cell.items"
              :key="index"
              class="item"
              :aria-label="label"
              :count
              :rarity
              role="img"
            />
          </span>
          <span v-if="cell.unlockLabel" class="unlock">{{ cell.unlockLabel }}</span>
          <span v-if="cell.isAchieved" class="achieved">
            <svg class="check" viewBox="0 0 252 228" aria-hidden="true"><path :d="CHECK_MARK_PATH" /></svg>
            <span class="hidden-label">{{ achievedLabel }}</span>
          </span>
          <span v-else class="status">{{ notAchievedLabel }}</span>
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.reputation-screen {
  position: absolute;
  inset: 0;
  color: #3b4255;
  font-weight: 600;
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: calc(var(--unit) * 20) calc(var(--unit) * 40);
  color: #ece5d8;
}

.title {
  margin: 0;
  font-size: calc(var(--unit) * 24);
}

.back {
  width: calc(var(--unit) * 56);
  height: calc(var(--unit) * 56);
  border: none;
  border-radius: 50%;
  background: rgb(255 255 255 / 0.15);
  color: #ece5d8;
  font: inherit;
  font-size: calc(var(--unit) * 28);
}

.detail {
  position: absolute;
  top: calc(var(--unit) * 165);
  left: calc(var(--unit) * 85);
  width: calc(var(--unit) * 520);
  color: #ece5d8;
}

.headline {
  margin: 0;
  font-size: calc(var(--unit) * 46);
}

.requirement {
  margin: calc(var(--unit) * 16) 0 0;
  font-size: calc(var(--unit) * 26);
}

/* The offer sits under the requirement, provisionally, until the reference frames it */
.offer {
  position: absolute;
  top: calc(var(--unit) * 380);
  left: calc(var(--unit) * 85);
  width: calc(var(--unit) * 520);
  color: #ece5d8;
}

.offer-title {
  margin: 0 0 calc(var(--unit) * 16);
  font-size: calc(var(--unit) * 26);
}

.accept {
  padding: calc(var(--unit) * 12) calc(var(--unit) * 32);
  border: none;
  border-radius: calc(var(--unit) * 8);
  background: #ece5d8;
  color: #3b4255;
  font: inherit;
  font-size: calc(var(--unit) * 26);
}

/* The list's panel, its rows 126 apart from 27 down and 32 in, a row 1145 wide */
.levels {
  position: absolute;
  top: calc(var(--unit) * 145);
  left: calc(var(--unit) * 652);
  display: flex;
  width: calc(var(--unit) * 1220);
  height: calc(var(--unit) * 870);
  flex-direction: column;
  gap: calc(var(--unit) * 5);
  margin: 0;
  padding: calc(var(--unit) * 27) calc(var(--unit) * 43) calc(var(--unit) * 27) calc(var(--unit) * 32);
  box-sizing: border-box;
  overflow-y: auto;
  background: #f0ebe5;
  list-style: none;
  scrollbar-width: none;
}

.level {
  position: relative;
  display: block;
  width: 100%;
  height: calc(var(--unit) * 121);
  padding: 0;
  box-sizing: border-box;
  border: calc(var(--unit) * 2) solid #dad4cd;
  border-width: calc(var(--unit) * 3) calc(var(--unit) * 2);
  border-left-color: #c8c2b6;
  background: #f6f1e8;
  color: #5a5758;
  font: inherit;
  text-align: left;
}

.level[data-achieved] {
  background: #e9e3d9;
}

.level[aria-pressed="true"] {
  background: rgb(255 255 255 / 0.6);
}

/* The level's pentagon, the row's height, its point 166 in; its drop shadow falls on the row to its right */
.badge {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: calc(var(--unit) * 166);
  filter: drop-shadow(calc(var(--unit) * 6) 0 calc(var(--unit) * 5) rgb(120 100 80 / 0.22));
}

.badge-face {
  position: absolute;
  inset: 0;
  background: #f8f4ee;
  clip-path: polygon(0 0, 83% 0, 100% 50%, 83% 100%, 0 100%);
}

.level[data-achieved] .badge-face {
  background: #f4eee4;
}

.badge-word,
.badge-number {
  position: absolute;
  left: 0;
  width: calc(var(--unit) * 146);
  color: #6a645b;
  line-height: 1;
  text-align: center;
}

.badge-word {
  top: calc(var(--unit) * 22);
  font-size: calc(var(--unit) * 22);
  letter-spacing: calc(var(--unit) * 2);
}

.badge-number {
  top: calc(var(--unit) * 49.5);
  font-size: calc(var(--unit) * 45);
}

.hidden-label {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}

.items {
  position: absolute;
  top: calc(var(--unit) * 20);
  left: calc(var(--unit) * 238);
  display: flex;
  gap: calc(var(--unit) * 12);
}

/* The clip's slots, 76 square, their counts at 16 */
.item {
  --count-size: 21cqh;

  width: calc(var(--unit) * 76);
  height: calc(var(--unit) * 76);
}

/* The unlock line, wrapped at 320 and set centred on the row, behind its info mark 12 to the left */
.unlock {
  position: absolute;
  top: 50%;
  left: calc(var(--unit) * 528);
  width: calc(var(--unit) * 320);
  font-size: calc(var(--unit) * 27);
  letter-spacing: calc(var(--unit) * 2);
  line-height: calc(var(--unit) * 32);
  translate: 0 -50%;
}

.unlock::before {
  position: absolute;
  top: 50%;
  left: calc(var(--unit) * -45);
  width: calc(var(--unit) * 31);
  height: calc(var(--unit) * 31);
  border: calc(var(--unit) * 1) solid #d4cfc8;
  border-radius: 50%;
  background: #fbfaf4;
  color: #36362f;
  content: "i";
  font-size: calc(var(--unit) * 20);
  letter-spacing: 0;
  line-height: calc(var(--unit) * 31);
  text-align: center;
  translate: 0 -50%;
}

/* The row's end, 189 wide: the tick where the level is achieved, else the not achieved block */
.achieved,
.status {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  width: calc(var(--unit) * 189);
  align-items: center;
  justify-content: center;
}

.check {
  width: calc(var(--unit) * 52);
  height: calc(var(--unit) * 47);
  margin-bottom: calc(var(--unit) * 4);
  fill: #8cbc2c;
}

.status {
  background: #ebe3d9;
  color: #92867a;
  font-size: calc(var(--unit) * 31);
}
</style>
