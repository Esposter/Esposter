<script setup lang="ts">
import type { PartySetupSlot } from "#src/models/PartySetupSlot";

interface Props {
  // The words of the buttons in the reader's language
  backLabel: string;
  configureTeamLabel: string;
  deployLabel: string;
  quickSetupLabel: string;
  // The team on the screen: its name and its four slots in slot order
  slots: PartySetupSlot[];
  teamName: string;
  // The screen's title, the game's own words for Party Setup
  title: string;
}

const { backLabel, configureTeamLabel, deployLabel, quickSetupLabel, slots, teamName, title } = defineProps<Props>();
const emit = defineEmits<{ close: []; configureTeam: []; deploy: []; next: []; previous: []; quickSetup: [] }>();
</script>

<template>
  <!-- Party Setup as the English PC client draws it at 1080 high, its positions measured off the frame: the title and Close
       at the top, the team's four members across the middle with a name plate over each (its element's mark, its name and
       its level), the arrows at either edge to step to another team, and the foot's team name, Configure Team, Quick Setup
       and Deploy. The members' art and the title's icon are the frame's own, drawn by no piece here -->
  <div class="party-setup-screen">
    <header class="head">
      <h1 class="title">{{ title }}</h1>
      <button class="back" :aria-label="backLabel" type="button" @click="emit('close')">
        <svg viewBox="0 0 56 56" aria-hidden="true">
          <path d="M18 18 38 38M38 18 18 38" />
        </svg>
      </button>
    </header>
    <section class="team">
      <button class="step previous" type="button" @click="emit('previous')">
        <svg viewBox="0 0 30 30" aria-hidden="true">
          <path d="M20 4 9 15l11 11" />
        </svg>
      </button>
      <ol class="slots">
        <li v-for="(slot, index) of slots" :key="index" class="slot" :data-empty="!slot.levelText || undefined">
          <div v-if="slot.levelText" class="plate">
            <span class="name">
              <svg v-if="slot.elementMarkPath" class="element" viewBox="0 0 1600 1600" aria-hidden="true">
                <path :d="slot.elementMarkPath" />
              </svg>
              {{ slot.name }}
            </span>
            <span class="level">{{ slot.levelText }}</span>
          </div>
          <span v-else class="plus" aria-hidden="true">+</span>
        </li>
      </ol>
      <button class="step next" type="button" @click="emit('next')">
        <svg viewBox="0 0 30 30" aria-hidden="true">
          <path d="M10 4l11 11-11 11" />
        </svg>
      </button>
    </section>
    <footer class="foot">
      <div class="team-bar">
        <p class="team-name">{{ teamName }}</p>
        <button class="action" type="button" @click="emit('configureTeam')">{{ configureTeamLabel }}</button>
      </div>
      <div class="deploy-bar">
        <button class="action" type="button" @click="emit('quickSetup')">{{ quickSetupLabel }}</button>
        <button class="action" type="button" @click="emit('deploy')">{{ deployLabel }}</button>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.party-setup-screen {
  position: absolute;
  inset: 0;
  color: #ece5d8;
  font-weight: 600;
}

.head {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: calc(var(--unit) * 94);
}

.title {
  position: absolute;
  top: calc(var(--unit) * 34);
  left: calc(var(--unit) * 122);
  margin: 0;
  font-size: calc(var(--unit) * 26);
  line-height: 1;
}

.back {
  position: absolute;
  top: calc(var(--unit) * 19);
  right: calc(var(--unit) * 50);
  width: calc(var(--unit) * 56);
  height: calc(var(--unit) * 56);
  padding: 0;
  border: none;
  border-radius: 50%;
  background: #ece5d8;
  color: #1c2140;
}

.back svg,
.step svg {
  width: 100%;
  height: 100%;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.back svg {
  stroke-width: 5;
}

.team {
  position: absolute;
  inset: 0;
}

.step {
  position: absolute;
  top: calc(var(--unit) * 520);
  width: calc(var(--unit) * 40);
  height: calc(var(--unit) * 40);
  padding: 0;
  border: none;
  background: none;
  color: #ece5d8;
}

.previous {
  left: calc(var(--unit) * 55);
}

.next {
  right: calc(var(--unit) * 55);
}

.step svg {
  stroke-width: 3;
}

.slots {
  position: absolute;
  top: 0;
  bottom: 0;
  left: calc(var(--unit) * 290);
  display: flex;
  margin: 0;
  padding: 0;
  list-style: none;
}

.slot {
  position: relative;
  flex: none;
  width: calc(var(--unit) * 333);
  height: 100%;
}

.slot:nth-child(1) .plate {
  top: calc(var(--unit) * 254);
}

.slot:nth-child(2) .plate {
  top: calc(var(--unit) * 335);
}

.slot:nth-child(3) .plate {
  top: calc(var(--unit) * 291);
}

.slot:nth-child(4) .plate {
  top: calc(var(--unit) * 213);
}

.plate {
  position: absolute;
  right: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-shadow: 0 calc(var(--unit) * 2) calc(var(--unit) * 6) rgb(0 0 0 / 0.6);
}

.element {
  width: calc(var(--unit) * 26);
  height: calc(var(--unit) * 26);
  margin-right: calc(var(--unit) * 8);
  vertical-align: middle;
  fill: #ece5d8;
}

.name {
  font-size: calc(var(--unit) * 26);
  line-height: 1;
}

.level {
  margin-top: calc(var(--unit) * 4);
  font-size: calc(var(--unit) * 20);
  line-height: 1;
  opacity: 0.85;
}

.plus {
  position: absolute;
  top: calc(var(--unit) * 480);
  left: calc(50% - var(--unit) * 48);
  display: flex;
  width: calc(var(--unit) * 96);
  height: calc(var(--unit) * 96);
  align-items: center;
  justify-content: center;
  border: calc(var(--unit) * 2) dashed rgb(255 255 255 / 0.5);
  border-radius: 50%;
  font-size: calc(var(--unit) * 56);
  opacity: 0.6;
}

.foot {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: calc(var(--unit) * 24) calc(var(--unit) * 60);
}

.team-name {
  margin: 0;
  font-size: calc(var(--unit) * 24);
}

.team-bar,
.deploy-bar {
  display: flex;
  align-items: center;
  gap: calc(var(--unit) * 24);
}

.action {
  min-width: calc(var(--unit) * 200);
  padding: calc(var(--unit) * 12) calc(var(--unit) * 24);
  border: none;
  border-radius: calc(var(--unit) * 8);
  background: rgb(255 255 255 / 0.15);
  color: #ece5d8;
  font: inherit;
  font-size: calc(var(--unit) * 22);
}
</style>
