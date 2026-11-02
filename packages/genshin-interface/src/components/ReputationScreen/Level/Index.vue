<script setup lang="ts">
import type { ReputationLevelCell } from "#src/models/ReputationLevelCell";

import ItemTile from "#src/components/ItemTile/Index.vue";
import { CHECK_MARK_PATH, GAME_ROW_HOVER, GAME_ROW_PRESS } from "#src/services/constants";

interface Props {
  // The achieved mark's words in the reader's language, read to assistive technology in place of the mark
  achievedLabel: string;
  // One level the reward page lists: its number, the items it pays, its unlock line and whether it is reached
  cell: ReputationLevelCell;
  // The badge's word over each level's number, "Lv." in English
  levelLabel: string;
  // The words a level the nation's Reputation has not reached shows in place of the achieved mark
  notAchievedLabel: string;
}

const level = defineModel<number>("level", { default: 0 });
const { achievedLabel, cell, levelLabel, notAchievedLabel } = defineProps<Props>();
</script>

<template>
  <button
    class="level gradient-tint"
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
        count-size="21cqh"
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
</template>

<style scoped>
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
  --tint-hover: v-bind(GAME_ROW_HOVER);
  --tint-press: v-bind(GAME_ROW_PRESS);
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
  font-size: calc(var(--unit) * 41);
}

/* The clip's slots, 76 square, their counts at 16 */
.items {
  position: absolute;
  top: calc(var(--unit) * 20);
  left: calc(var(--unit) * 238);
  display: flex;
  gap: calc(var(--unit) * 12);
}

.item {
  width: calc(var(--unit) * 76);
  height: calc(var(--unit) * 76);
}

/* The unlock line, wrapped at 320 and set centred on the row two units lower, as the clip's lines sit; its info mark
   stands 41 to the left of the line */
.unlock {
  position: absolute;
  top: calc(50% + var(--unit) * 2);
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
  left: calc(var(--unit) * -41);
  width: calc(var(--unit) * 25);
  height: calc(var(--unit) * 25);
  border: calc(var(--unit) * 1) solid #d4cfc8;
  border-radius: 50%;
  background: #fbfaf4;
  color: #36362f;
  content: "i";
  font-size: calc(var(--unit) * 20);
  letter-spacing: 0;
  line-height: calc(var(--unit) * 25);
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

<style scoped src="../../../styles/gradientTint.css"></style>

<style scoped src="../../../styles/visuallyHidden.css"></style>
