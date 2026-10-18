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
  <!-- Party Setup, the team the player is looking at, fitted to the public clip's frame at 1080 high: the team's name and
       Configure Team at the foot's left, its four members standing across the middle with a name plate over each (its
       name, its element's mark and its level), an empty slot a plus, the arrows at either edge to step to the other teams,
       and Quick Setup and Deploy at the foot's right. The parity pass measures it against that frame -->
  <div class="party-setup-screen">
    <header class="head">
      <h1 class="title">{{ title }}</h1>
      <button class="back" :aria-label="backLabel" type="button" @click="emit('close')">↶</button>
    </header>
    <section class="team">
      <button class="step previous" type="button" @click="emit('previous')">‹</button>
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
      <button class="step next" type="button" @click="emit('next')">›</button>
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
  display: flex;
  flex-direction: column;
  color: #ece5d8;
  font-weight: 600;
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: calc(var(--unit) * 20) calc(var(--unit) * 40);
}

.title {
  margin: 0;
  font-size: calc(var(--unit) * 24);
}

.back,
.step {
  width: calc(var(--unit) * 56);
  height: calc(var(--unit) * 56);
  border: none;
  border-radius: 50%;
  background: rgb(255 255 255 / 0.15);
  color: #ece5d8;
  font: inherit;
  font-size: calc(var(--unit) * 28);
}

.team {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: space-between;
  padding: 0 calc(var(--unit) * 60);
}

.slots {
  display: flex;
  flex: 1;
  justify-content: center;
  gap: calc(var(--unit) * 40);
  margin: 0;
  padding: 0;
  list-style: none;
}

.slot {
  display: flex;
  width: calc(var(--unit) * 300);
  height: calc(var(--unit) * 600);
  flex-direction: column;
  align-items: center;
  padding-top: calc(var(--unit) * 200);
  box-sizing: border-box;
}

.slot[data-empty] {
  justify-content: center;
  padding-top: 0;
}

.plate {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: calc(var(--unit) * 6);
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
  font-size: calc(var(--unit) * 24);
}

.level {
  font-size: calc(var(--unit) * 18);
  opacity: 0.85;
}

.plus {
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

.team-name {
  margin: 0;
  font-size: calc(var(--unit) * 24);
}

.foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: calc(var(--unit) * 24) calc(var(--unit) * 60);
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
