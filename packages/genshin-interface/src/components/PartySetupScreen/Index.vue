<script setup lang="ts">
import type { PartySetupSlot } from "#src/models/PartySetupSlot";

interface Props {
  // The words of the buttons in the reader's language
  backLabel: string;
  configureTeamLabel: string;
  deployLabel: string;
  // The party the next arrow steps to, and the one the previous arrow steps to, named in the reader's language
  nextLabel: string;
  previousLabel: string;
  quickSetupLabel: string;
  // The words of the Elemental Resonance button at the top right, in the reader's language
  resonanceLabel: string;
  // The team on the screen: its name and its four slots in slot order
  slots: PartySetupSlot[];
  teamName: string;
  // The screen's title, the game's own words for Party Setup
  title: string;
}

const {
  backLabel,
  configureTeamLabel,
  deployLabel,
  nextLabel,
  previousLabel,
  quickSetupLabel,
  resonanceLabel,
  slots,
  teamName,
  title,
} = defineProps<Props>();
const emit = defineEmits<{ close: []; configureTeam: []; deploy: []; next: []; previous: []; quickSetup: [] }>();
</script>

<template>
  <!-- Party Setup as the English PC client draws it at 1080 high, its positions measured off the frame: the title, the step
       dots, Elemental Resonance and Close at the top, the team's four members across the middle with a name plate over each
       (its element's mark, its name and its level), the arrows at either edge to step to another team, and the foot's team
       name, Configure Team, Quick Setup and Deploy. The members' art is the frame's own, drawn by no piece here -->
  <div class="party-setup-screen">
    <header class="head">
      <svg class="party-icon" viewBox="56 24 40 52" aria-hidden="true">
        <circle class="back" cx="84" cy="35" r="5.5" />
        <path class="back" d="M80 44h13l-3.5 16q-2.5 8-5 8t-4-8z" />
        <circle class="front" cx="72" cy="34.5" r="6.5" />
        <path class="front" d="M60 46h24l-11.5 25h-2z" />
      </svg>
      <h1 class="title">{{ title }}</h1>
      <svg class="steps" viewBox="880 30 150 36" aria-hidden="true">
        <path class="step-on" d="M906 37l10.5 10.5-10.5 10.5-10.5-10.5z" />
        <path
          class="step-off"
          d="M942 39.5l8.5 8.5-8.5 8.5-8.5-8.5z M978 39.5l8.5 8.5-8.5 8.5-8.5-8.5z M1014 39.5l8.5 8.5-8.5 8.5-8.5-8.5z"
        />
      </svg>
      <div class="resonance-pill" aria-hidden="true" />
      <svg class="resonance-icon" viewBox="0 0 136 120" aria-hidden="true">
        <path
          fill-rule="evenodd"
          d="M61.5 20h45l3 1 2.5 2.5 1 2v9l-5.5 4.5h-35l-2 1-1-1h-10l-4.5-3.5q-2-2.5-1-8l3.5-6.5q3.25.75 4-1z M23.5 21h11l4.5 3.5q2 2.5 1 8l-4.5 5.5q-2.83 2.17-9 1l-3-1-4.5-4.5v-6l1-3 3.5-3.5z M62.5 51h42q.75 1.75 4 1l3.5 2.5 2 5q-2.25 1.25-1 6l-3.5 3.5-2 1h-10l-1 1h-35l-3-1-4.5-4.5v-7l1-3 3.5-3.5q3.25.75 4-1z M25.5 52h9l5.5 5.5q1.53 9.03-3.5 11.5l-6 2h-3l-6.5-4.5q-2.33-3.17-1-10l5.5-4.5z M65.5 82l3 1h39l4.5 2.5 1 3v8l-2.5 3.5-3 1h-48l-5.5-4.5v-8q2.5-1 2-3.5l4.5-2q4 1 5-1z M27.5 83h4l5.5 2q-.5 2.5 2 3.5l1 5q-1.75.75-1 4l-2.5 2.5-3 1h-6l-1-1h-3l-2.5-1-2-6.5 1-1v-3l1-2.5 6.5-3z"
        />
      </svg>
      <p class="resonance-text">{{ resonanceLabel }}</p>
      <button class="back" :aria-label="backLabel" type="button" @click="emit('close')">
        <svg viewBox="0 0 58 58" aria-hidden="true">
          <path d="M17.5 17.5 40.5 40.5M40.5 17.5 17.5 40.5" />
        </svg>
      </button>
    </header>
    <section class="team">
      <button class="step previous" :aria-label="previousLabel" type="button" @click="emit('previous')">
        <svg viewBox="54 514 40 52" aria-hidden="true">
          <path class="chevron" d="M58.5 540 80.5 520.5v7l-10.5 12.5 10.5 12.5v8z" />
          <path class="ornament" d="M71 540 81 530l9 10-9 10z" />
        </svg>
      </button>
      <ol class="slots">
        <li v-for="(slot, index) of slots" :key="index" class="slot">
          <div v-if="slot.levelText" class="plate">
            <span class="name">
              <svg
                v-if="slot.elementMarkPath"
                class="element"
                :style="{ fill: slot.elementColor }"
                viewBox="0 0 1600 1600"
                aria-hidden="true"
              >
                <path :d="slot.elementMarkPath" />
              </svg>
              {{ slot.name }}
            </span>
            <span class="level">{{ slot.levelText }}</span>
          </div>
          <span v-else class="plus" aria-hidden="true">+</span>
        </li>
      </ol>
      <button class="step next" :aria-label="nextLabel" type="button" @click="emit('next')">
        <svg viewBox="54 514 40 52" aria-hidden="true">
          <path class="chevron" d="M58.5 540 80.5 520.5v7l-10.5 12.5 10.5 12.5v8z" />
          <path class="ornament" d="M71 540 81 530l9 10-9 10z" />
        </svg>
      </button>
    </section>
    <footer class="foot">
      <button class="configure" :aria-label="configureTeamLabel" type="button" @click="emit('configureTeam')" />
      <p class="team-name">{{ teamName }}</p>
      <button class="quick" type="button" @click="emit('quickSetup')">{{ quickSetupLabel }}</button>
      <button class="deploy" type="button" @click="emit('deploy')">{{ deployLabel }}</button>
      <svg class="foot-art" viewBox="0 0 1920 1080" aria-hidden="true">
        <path class="list" d="M64 1008h24v3H64zM64 1015h22v3H64zM64 1023h20v3H64z" />
        <circle class="list" cx="88" cy="1018" r="3.5" />
        <path class="list" d="M84 1023h9l-4.5 9z" />
        <circle class="dark" cx="1210" cy="1020" r="20" />
        <circle class="green" cx="1210" cy="1013" r="4.5" />
        <path class="green" d="M1202 1019h16l-8 12z" />
        <circle class="dim" cx="1556" cy="1020" r="14" />
        <g class="pencil" transform="translate(216 1004) scale(0.25)">
          <path
            fill-rule="evenodd"
            d="M88.5 24h4l4.5 2q-1.12 2.67 1.5 2l3.5 5.5v6q-.75 3.25-5.5 2.5l-11.5-10.5-1-4 1-2.5q2.58.75 3.5-1z M74.5 37h5l11.5 11.5-1 4-11.5 12.5-10.5 9.5-5.5 6.5-9 6q-3.25-.75-4 1h-6l-3.5-2.5q-2-2.5-1-8l4-9 19.5-20.5q2.25.75 1.5-1.5l10.5-9.5z M28.5 22h43l.5 1.5q2 1 0 2l-4.5 5.5h-35l-3.5 2.5v59l-1 1 2.5 3.5 3 1h9l1-1h27l1 1h8l1-1h7l3 1 3-1 2.5-2.5v-34l3.5-4.5q3.75-.75 4.5 1.5-1 4 1 5v33q-1.75.75-1 4l-3.5 5.5-4 2h-68l-6.5-4.5-2-4v-67l2-5 2.5-2.5 4-2z"
          />
        </g>
      </svg>
    </footer>
  </div>
</template>

<style scoped>
.party-setup-screen {
  position: absolute;
  inset: 0;
  color: #eef8ff;
  font-weight: 600;
}

.head {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: calc(var(--unit) * 94);
}

.party-icon {
  position: absolute;
  top: calc(var(--unit) * 24);
  left: calc(var(--unit) * 56);
  width: calc(var(--unit) * 40);
  height: calc(var(--unit) * 52);
}

.party-icon .front {
  fill: #f4f8fd;
}

.party-icon .back {
  fill: #707891;
}

.title {
  position: absolute;
  top: calc(var(--unit) * 35);
  left: calc(var(--unit) * 122);
  margin: 0;
  font-size: calc(var(--unit) * 26);
  line-height: 1;
  letter-spacing: calc(var(--unit) * 1.6);
}

.steps {
  position: absolute;
  top: calc(var(--unit) * 30);
  left: calc(var(--unit) * 880);
  width: calc(var(--unit) * 150);
  height: calc(var(--unit) * 36);
}

.step-on {
  fill: #f4fbf8;
}

.step-off {
  fill: #07316e;
  stroke: #5a84c6;
  stroke-width: 2;
}

.resonance-pill {
  position: absolute;
  top: calc(var(--unit) * 27);
  left: calc(var(--unit) * 1430);
  width: calc(var(--unit) * 332);
  height: calc(var(--unit) * 40);
  border-radius: calc(var(--unit) * 20);
  background: rgb(255 255 255 / 0.08);
}

.resonance-icon {
  position: absolute;
  top: calc(var(--unit) * 33);
  left: calc(var(--unit) * 1446);
  width: calc(var(--unit) * 34);
  height: calc(var(--unit) * 30);
  fill: #ecfcff;
}

.resonance-text {
  position: absolute;
  top: calc(var(--unit) * 35);
  left: calc(var(--unit) * 1487);
  margin: 0;
  color: #c6d5f7;
  font-size: calc(var(--unit) * 26);
  line-height: 1;
  letter-spacing: calc(var(--unit) * 1.3);
  white-space: nowrap;
}

.back {
  position: absolute;
  top: calc(var(--unit) * 18.5);
  left: calc(var(--unit) * 1814);
  box-sizing: border-box;
  width: calc(var(--unit) * 58);
  height: calc(var(--unit) * 58);
  padding: 0;
  border: calc(var(--unit) * 5) solid #80858a;
  border-radius: 50%;
  background: #e1e2d4;
  color: #3f3e43;
}

.back svg {
  width: 100%;
  height: 100%;
  fill: none;
  stroke: currentColor;
  stroke-width: 7.5;
}

.team {
  position: absolute;
  inset: 0;
}

.step {
  position: absolute;
  top: calc(var(--unit) * 514);
  width: calc(var(--unit) * 40);
  height: calc(var(--unit) * 52);
  padding: 0;
  border: none;
  background: none;
}

.previous {
  left: calc(var(--unit) * 54);
}

.next {
  left: calc(var(--unit) * 1826);
}

.next svg {
  transform: scaleX(-1);
}

.step svg {
  width: 100%;
  height: 100%;
}

.chevron {
  fill: #e6e8e2;
}

.ornament {
  fill: #2a3257;
  stroke: #6c75a1;
  stroke-width: 2;
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
  top: calc(var(--unit) * 255);
}

.slot:nth-child(2) .plate {
  top: calc(var(--unit) * 337);
}

.slot:nth-child(3) .plate {
  top: calc(var(--unit) * 293);
}

.slot:nth-child(4) .plate {
  top: calc(var(--unit) * 216);
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
  position: relative;
  top: calc(var(--unit) * -2);
  width: calc(var(--unit) * 34);
  height: calc(var(--unit) * 34);
  margin: calc(var(--unit) * -4) calc(var(--unit) * 8) calc(var(--unit) * -4) 0;
  vertical-align: middle;
  fill: #eef8ff;
}

.name {
  font-size: calc(var(--unit) * 26);
  line-height: 1;
}

.level {
  margin-top: calc(var(--unit) * 5);
  margin-left: calc(var(--unit) * 7);
  color: #dce9ff;
  font-size: calc(var(--unit) * 20);
  line-height: 1;
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
  inset: 0;
  pointer-events: none;
}

.foot button,
.foot-art {
  pointer-events: auto;
}

.foot-art {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.configure {
  position: absolute;
  top: calc(var(--unit) * 995);
  left: calc(var(--unit) * 50);
  width: calc(var(--unit) * 50);
  height: calc(var(--unit) * 50);
  padding: 0;
  border: none;
  border-radius: 50%;
  background: #e1e2d4;
  box-shadow: 0 0 0 calc(var(--unit) * 3) rgb(200 205 215 / 0.5);
}

.team-name {
  position: absolute;
  top: calc(var(--unit) * 1008);
  left: calc(var(--unit) * 122);
  margin: 0;
  font-size: calc(var(--unit) * 26);
  line-height: 1;
}

.quick {
  position: absolute;
  top: calc(var(--unit) * 988);
  left: calc(var(--unit) * 1178);
  width: calc(var(--unit) * 322);
  height: calc(var(--unit) * 63);
  padding: 0 0 0 calc(var(--unit) * 89);
  border: none;
  border-radius: calc(var(--unit) * 31.5);
  background: #e8e1d6;
  color: #26262b;
  font: inherit;
  font-size: calc(var(--unit) * 30);
  letter-spacing: calc(var(--unit) * 1.5);
  text-align: left;
}

.deploy {
  position: absolute;
  top: calc(var(--unit) * 1008);
  left: calc(var(--unit) * 1636);
  padding: 0;
  border: none;
  background: none;
  color: #9fb0c8;
  font: inherit;
  font-size: calc(var(--unit) * 26);
}

.list {
  fill: #2e2d33;
}

.dark {
  fill: #33322a;
}

.green {
  fill: #a4c459;
}

.dim {
  fill: rgb(255 255 255 / 0.15);
}

.pencil {
  fill: #eef8ff;
}
</style>
