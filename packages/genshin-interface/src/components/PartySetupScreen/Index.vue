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
  <!-- Party Setup, the team the player is looking at: its name over its four slots in a row, arrows at either side to step
       to the other teams, and Deploy, Configure Team and Quick Setup beneath. A slot names its member with its level and
       element's mark, and an empty slot shows a plus. Its layout is provisional until the parity pass fits it to the
       public clip's frame -->
  <div class="party-setup-screen">
    <header class="head">
      <h1 class="title">{{ title }}</h1>
      <button class="back" :aria-label="backLabel" type="button" @click="emit('close')">↶</button>
    </header>
    <section class="team">
      <button class="step previous" type="button" @click="emit('previous')">‹</button>
      <div class="body">
        <p class="team-name">{{ teamName }}</p>
        <ol class="slots">
          <li v-for="(slot, index) of slots" :key="index" class="slot" :data-empty="!slot.levelText || undefined">
            <template v-if="slot.levelText">
              <svg v-if="slot.elementMarkPath" class="element" viewBox="0 0 1600 1600" aria-hidden="true">
                <path :d="slot.elementMarkPath" />
              </svg>
              <span class="name">{{ slot.name }}</span>
              <span class="level">{{ slot.levelText }}</span>
            </template>
            <span v-else class="plus" aria-hidden="true">+</span>
          </li>
        </ol>
      </div>
      <button class="step next" type="button" @click="emit('next')">›</button>
    </section>
    <footer class="actions">
      <button class="action" type="button" @click="emit('deploy')">{{ deployLabel }}</button>
      <button class="action" type="button" @click="emit('configureTeam')">{{ configureTeamLabel }}</button>
      <button class="action" type="button" @click="emit('quickSetup')">{{ quickSetupLabel }}</button>
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
  justify-content: center;
  gap: calc(var(--unit) * 24);
}

.body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: calc(var(--unit) * 24);
}

.team-name {
  margin: 0;
  font-size: calc(var(--unit) * 30);
}

.slots {
  display: flex;
  gap: calc(var(--unit) * 16);
  margin: 0;
  padding: 0;
  list-style: none;
}

.slot {
  position: relative;
  display: flex;
  width: calc(var(--unit) * 200);
  height: calc(var(--unit) * 300);
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: calc(var(--unit) * 16);
  border: calc(var(--unit) * 2) solid rgb(255 255 255 / 0.4);
  border-radius: calc(var(--unit) * 12);
  background: rgb(20 24 36 / 0.6);
  box-sizing: border-box;
}

.slot[data-empty] {
  justify-content: center;
  padding-bottom: 0;
  border-style: dashed;
}

.element {
  position: absolute;
  top: calc(var(--unit) * 12);
  right: calc(var(--unit) * 12);
  width: calc(var(--unit) * 36);
  height: calc(var(--unit) * 36);
  fill: #ece5d8;
}

.name {
  font-size: calc(var(--unit) * 22);
}

.level {
  font-size: calc(var(--unit) * 18);
}

.plus {
  font-size: calc(var(--unit) * 56);
  opacity: 0.6;
}

.actions {
  display: flex;
  justify-content: center;
  gap: calc(var(--unit) * 24);
  padding: calc(var(--unit) * 24);
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
