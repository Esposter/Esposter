<script setup lang="ts">
import type { ReputationLevelCell } from "#src/models/ReputationLevelCell";
import type { TextSegment } from "#src/models/TextSegment";

interface Props {
  // The achieved mark's words in the reader's language, read to assistive technology in place of the mark
  achievedLabel: string;
  // The way back to the world in the reader's language
  backLabel: string;
  // The picked level's reward, named as the game names it
  headline: string;
  // The levels in the game's order, each a row the picked one is drawn over
  levels: ReputationLevelCell[];
  // The picked level's requirement, its coloured runs as the game words them, "[]" where the screen names none
  requirement: TextSegment[];
  // The title the game shows over the page, its nation's name filled in
  title: string;
}

const levelId = defineModel<number>("levelId", { default: 0 });
const { achievedLabel, backLabel, headline, levels, requirement, title } = defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
</script>

<template>
  <!-- The Reputation reward page, the nation's keeper opens: its title across the head with the way back, the picked
       level's reward and requirement on the left, and the levels down the right, each with its reward, its unlock line
       and whether it is achieved. Provisional: every place, size and colour here, and the reward icons that stand for
       the items, wait on the reputation screen's passes against the public clip (references/reputation-screen) -->
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
    <ul class="levels">
      <li v-for="level of levels" :key="level.id">
        <button class="level" :aria-pressed="level.id === levelId" type="button" @click="levelId = level.id">
          <span class="level-label">{{ level.levelLabel }}</span>
          <span class="items">
            <span class="hidden-label">{{ level.itemCountLabel }}</span>
            <span v-for="index of level.itemCount" :key="index" class="item" />
          </span>
          <span class="unlock">{{ level.unlockLabel }}</span>
          <span v-if="level.isAchieved" class="achieved">
            <span aria-hidden="true">✓</span>
            <span class="hidden-label">{{ achievedLabel }}</span>
          </span>
          <span v-else class="status">{{ level.statusLabel }}</span>
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

.levels {
  position: absolute;
  top: calc(var(--unit) * 145);
  left: calc(var(--unit) * 652);
  display: flex;
  width: calc(var(--unit) * 1220);
  height: calc(var(--unit) * 870);
  flex-direction: column;
  margin: 0;
  padding: calc(var(--unit) * 24) calc(var(--unit) * 33);
  box-sizing: border-box;
  overflow-y: auto;
  background: rgb(245 240 230 / 0.92);
  list-style: none;
}

.level {
  display: flex;
  width: 100%;
  height: calc(var(--unit) * 126);
  align-items: center;
  gap: calc(var(--unit) * 24);
  padding: 0 calc(var(--unit) * 24);
  border: none;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
}

.level[aria-pressed="true"] {
  background: rgb(255 255 255 / 0.6);
}

.level-label {
  width: calc(var(--unit) * 130);
  font-size: calc(var(--unit) * 30);
}

.hidden-label {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}

.items {
  display: flex;
  width: calc(var(--unit) * 200);
  gap: calc(var(--unit) * 12);
}

.item {
  width: calc(var(--unit) * 76);
  height: calc(var(--unit) * 76);
  border-radius: calc(var(--unit) * 6);
  background: rgb(120 110 150 / 0.35);
}

.unlock {
  flex: 1;
  font-size: calc(var(--unit) * 24);
}

.achieved {
  color: #3da35a;
  font-size: calc(var(--unit) * 36);
}

.status {
  color: #8c8273;
  font-size: calc(var(--unit) * 24);
}
</style>
