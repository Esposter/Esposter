<script setup lang="ts">
import Member from "#src/components/BlessingScreen/Member/Index.vue";
import CloseButton from "#src/components/CloseButton/Index.vue";
import GameButton from "#src/components/GameButton/Index.vue";
import { CloseButtonMark } from "#src/models/CloseButtonMark";
import { GameButtonKind } from "#src/models/GameButtonKind";
import { INTERACTION_HOVER_DURATION, INTERACTION_REST_DURATION } from "#src/services/constants";

interface BlessingMember {
  // The share of the member's Max HP it holds, which its health bar shows
  healthShare: number;
  id: number;
  // The member's level as the game writes it, when the host knows it
  levelText?: string;
  // The member's name in the reader's language
  name: string;
}

interface Props {
  // The way out of the screen in the reader's language
  closeLabel: string;
  // Whether auto-recover's switch is on
  isAutoRecoverOn: boolean;
  // The members of the deployed team, which the game lists as in combat
  members: BlessingMember[];
  // The members of the teams not deployed, which the game lists as preparing for combat
  waitingMembers?: BlessingMember[];
  // The Restorative Power the pool holds now, and the most it holds
  poolAmount: number;
  poolMaximum: number;
  // The percentage of a member's Max HP auto-recover heals it up to
  thresholdPercent: number;
  // The title the game shows at the top of its panel, and the title of the Worship screen the screen switches to
  title: string;
  worshipTitle: string;
}

const {
  closeLabel,
  isAutoRecoverOn,
  members,
  poolAmount,
  poolMaximum,
  thresholdPercent,
  title,
  waitingMembers = [],
  worshipTitle,
} = defineProps<Props>();
const emit = defineEmits<{
  close: [];
  heal: [characterId: number];
  stepThreshold: [direction: -1 | 1];
  toggleAutoRecover: [];
  worship: [];
}>();
</script>

<template>
  <!-- The layout is measured off the completionist clip's Statue's Blessing at 173 seconds, in the frame's own pixels at 1080
       High (`--unit` is one pixel of it): the deployed team's section on the left, the teams not deployed under it, and the
       pool, the auto-recover switch and its threshold in a panel down the right. Words the dump holds no key for, and the art
       the game ships, are not drawn -->
  <div class="blessing-screen">
    <div class="glass" aria-hidden="true" />
    <div class="halo" aria-hidden="true" />
    <svg class="ring" viewBox="0 0 300 300" aria-hidden="true">
      <defs>
        <linearGradient id="blessing-ring-band" gradientUnits="userSpaceOnUse" x1="150" x2="150" y1="30" y2="270">
          <stop offset="0" stop-color="#b1ec86" />
          <stop offset="1" stop-color="#46d69c" />
        </linearGradient>
      </defs>
      <path
        fill="url(#blessing-ring-band)"
        d="M150 13Q154 26 168.5 31.5A120 120 0 0 1 268.5 131.5Q274 146 287 150Q274 154 268.5 168.5A120 120 0 0 1 168.5 268.5Q154 274 150 287Q146 274 131.5 268.5A120 120 0 0 1 31.5 168.5Q26 154 13 150Q26 146 31.5 131.5A120 120 0 0 1 131.5 31.5Q146 26 150 13Z"
      />
      <circle cx="150" cy="150" r="107" fill="rgb(38 80 76)" />
      <g transform="translate(111.5 110) scale(0.3333)" fill="#87fc95">
        <path
          fill-rule="evenodd"
          d="M118.5 8l3.5 2.5q2.79 7.21 8 12 2.94 8.56 8 15l15 19 1 3 11 13v2l3 6 8 11 2 6 6 10 1 5 2 3 1 7 1 1v23l-1 1-1 6-9 19-8.5 10.5-15 12-7 3h-6q-3.33-1.67-2.5-7.5l3.5-4.5 3-1 12.5-9.5 7-8 6-12 3-3 1-12 1-1v-12l-1-1-1-7-2-3-1-5-2-2-10-20-3-5-8.5-8.5-6.5-5.5-3.5-4.5-20-18-5.5 3.5-7.5 9.5-19.5 18.5q-3.9 7.1-10 12l-5 10v2l-3 3-3 9-3 5-1 7-1 1 1 1v15l4 12 7 12 7.5 8.5 12 7 5.5 5.5q1.46 7.96-2.5 10.5l-4-2-6-1-18.5-15.5-5-6-6-10-3-7v-3l-2-3v-38l7-17 4-5 1-4 7-9 5-10 26-33 3-5v-2l4-4v-2l3-5 7.5-9.5 2-1z"
        />
        <path
          fill-rule="evenodd"
          d="M41.5 49h3l3.5 2.5 1 2v10l-5 15-13 20-3 7v3l-3 6v4l-2 6v18l1 1v10l3 6v4l5 9 2 6 9.5 11.5 2.5 1.5 8.5 9.5 24 13 14 2 2-2h2l8.5-4v-1.5l3-3 1-3v-17l-5.5-7.5h-2l-4-3-4-1-12.5-11.5-6-10v-4l-2-5v-15l1-1v-3l2-5.5 2.5-1h4l1 1 11 2 9 5h2l2 2 4 1 8 5 6 1 1 1h6l1-1 7-1 2-2 9-3q1.75-3.25 6-4l3.5 2.5 1 2v16l-2 3v3l-3 7-5.5 7.5-6 5h-2l-4 4-5 3h-2l-2.5 2.5-4 7v21l-1 3-8.5 8.5-3 1-14 10q-4.68.82-7 4h-2l-11-5h-2l-2-2q-5.64-.86-9-4h-2l-18.5-12.5-2.5-3.5-10.5-9.5-7-8-5-11-3-3-2-8-2-3-1-8-3-5v-33l2-5v-4l1-1v-4l2-5v-4l4-7 3-10 15-26 4.5-4.5z"
        />
        <path
          fill-rule="evenodd"
          d="M188.5 51q8.31-1.31 10.5 3.5l6 13 5 5q.86 5.64 4 9l1 5 5 10v5l2 5 1 10 2 4v17l1 1-1 1v13l-2 3-1 7-5 11v3l-2 2v2l-4 7-9 11-10.5 10.5q-2.25-.75-1.5 1.5l-7.5 6.5-11 5-5 4-18 6-10 6-8.5 7.5-2.5 4.5-2.5 1.5v2l-4.5 7.5-3 1-4.5-3.5-4-9v-4l6.5-7.5 5-3 10-9 8-4 12-3 15-7 8-6 5-2 5.5-5.5 2.5-3.5 2.5-1.5 13-16 1-5 5-10v-4l3-6v-6l1-1v-22l-1-1v-6l-3-6-3-10-16-26v-3l-2-3q1-4-1-5v-10l2.5-2.5z"
        />
      </g>
    </svg>
    <section class="section">
      <span class="diamond" aria-hidden="true" />
      <ul class="members">
        <li v-for="{ healthShare, id, levelText, name } of members" :key="id">
          <Member :health-share :level-text :name @heal="emit('heal', id)" />
        </li>
      </ul>
    </section>
    <section v-if="waitingMembers.length" class="section waiting">
      <span class="diamond" aria-hidden="true" />
      <ul class="members">
        <li v-for="{ healthShare, id, levelText, name } of waitingMembers" :key="id">
          <Member :health-share :level-text :name @heal="emit('heal', id)" />
        </li>
      </ul>
    </section>
    <svg class="statue" viewBox="0 0 150 174" aria-hidden="true">
      <path
        fill="#82da74"
        fill-rule="evenodd"
        d="M67.5 22l7 3 21.5 20.5 6 7q2.34 6.16 7 10v2l3 3 12 25v21q-2.25 1.25-1 6l-2 2-2 6v3l-3 3-5 9-5.5 5.5-10 8-7 1-5 3h-30l-7-3-6-1-10.5-8.5-1.5-2.5-3.5-2.5-1-3-8-9-2-8-2-3v-27q1.75-.75 1-4l7-14 4-4v-3l3-6 5-7 19.5-21.5 9-8 7-3zm-2.5 45-2 1-4 7v13l-2 2h-15l-3 1-3 5q-1 6 1 9l5 3h10l1-1q0 2 4 1l2 3v12q2 0 1 4l6 4q4 1 7-1l3-4q-1-5 1-6v-10l2-2q4 1 6-1 6-1 10 1l4-4 1-3q1-5-1-6l-4-5h-15l-3-2-1-3 1-3v-7l-4-5v-2l-2-1h-6z"
      />
    </svg>
    <p class="title" role="heading" aria-level="1">{{ title }}</p>
    <CloseButton class="close" :label="closeLabel" :mark="CloseButtonMark.Cross" @click="emit('close')" />
    <p class="pool">
      <span class="amount">{{ Math.floor(poolAmount) }}</span> / {{ poolMaximum }}
    </p>
    <div class="band" aria-hidden="true" />
    <GameButton
      class="switch"
      :aria-pressed="isAutoRecoverOn"
      :kind="GameButtonKind.Row"
      tip=""
      @click="emit('toggleAutoRecover')"
    >
      <span :class="['toggle', { off: !isAutoRecoverOn }]" aria-hidden="true"><span class="knob" /></span>
    </GameButton>
    <button
      class="step decrease ring-button"
      type="button"
      aria-label="Lower the threshold"
      @click="emit('stepThreshold', -1)"
    />
    <span class="percent">{{ thresholdPercent }}%</span>
    <button
      class="step increase ring-button"
      type="button"
      aria-label="Raise the threshold"
      @click="emit('stepThreshold', 1)"
    />
    <GameButton class="worship" :kind="GameButtonKind.Row" tip="" @click="emit('worship')">{{
      worshipTitle
    }}</GameButton>
  </div>
</template>

<style scoped src="../../styles/ringButton.css"></style>

<style scoped>
.blessing-screen {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  color: #d0dad5;
}

/* The panel's glass, down the reference's column from 1367 to the frame's right edge. Its colour at each height is the
   reference's own, solved at three quarters strength over the mid grey the parity page stands a screen on, since the world
   does not yet show through the glass: provisional until it does */
.glass {
  position: absolute;
  top: 0;
  bottom: 0;
  left: calc(var(--unit) * 1367);
  width: calc(var(--unit) * 553);
  background: linear-gradient(
    rgb(7 25 37 / 75%),
    rgb(30 56 60 / 75%) 60%,
    rgb(86 114 134 / 75%) 80%,
    rgb(105 140 128 / 75%)
  );
}

/* The emblem's halo, an eight-pointed star a shade lighter than the glass, centred on the ring at 1643.5, 365 */
.halo {
  position: absolute;
  top: calc(var(--unit) * 162);
  left: calc(var(--unit) * 1441);
  width: calc(var(--unit) * 405);
  height: calc(var(--unit) * 405);
  background: rgb(150 200 190 / 10%);
  clip-path: polygon(
    50% 0%,
    61.48% 22.28%,
    85.36% 14.64%,
    77.72% 38.52%,
    100% 50%,
    77.72% 61.48%,
    85.36% 85.36%,
    61.48% 77.72%,
    50% 100%,
    38.52% 77.72%,
    14.64% 85.36%,
    22.28% 61.48%,
    0% 50%,
    22.28% 38.52%,
    14.64% 14.64%,
    38.52% 22.28%
  );
}

/* The statue's mark at the title's left, a green drop with its plus cut out, traced from the reference's own pixels at three
   times (its SVG is 50 by 58 units at the reference's place) */
.statue {
  position: absolute;
  top: calc(var(--unit) * 16);
  left: calc(var(--unit) * 1408);
  width: calc(var(--unit) * 50);
  height: calc(var(--unit) * 58);
}

/* The emblem's ring, a 240 unit band of 13 units with four spikes at its compass points (its SVG is a 300 unit square about
   the centre at 1643.5, 365), lit from its top yellow-green to its foot teal. Its drop glyph is traced from the reference's
   own pixels (`trace`), as the game draws it, scaled back from the trace's three times */
.ring {
  position: absolute;
  top: calc(var(--unit) * 215);
  left: calc(var(--unit) * 1493.5);
  width: calc(var(--unit) * 300);
  height: calc(var(--unit) * 300);
}

.title {
  position: absolute;
  top: calc(var(--unit) * 32);
  left: calc(var(--unit) * 1367);
  width: calc(var(--unit) * 553);
  margin: 0;
  color: #9ef293;
  font-size: calc(var(--unit) * 30);
  font-weight: 600;
  line-height: calc(var(--unit) * 30);
  letter-spacing: calc(var(--unit) * 1.6);
  text-align: center;
}

/* The close sits at the panel's top right, its disc and ring left to the screen that places it */
.blessing-screen > .close {
  top: calc(var(--unit) * 19);
  right: calc(var(--unit) * 38);
  background: #eee9e8;
  box-shadow: inset 0 0 0 calc(var(--unit) * 6) #929390;
  color: #3e4251;
}

.section {
  position: absolute;
  top: 0;
  left: 0;
}

/* The second section starts 261 units below the first, as the clip's two headings do */
.waiting {
  top: calc(var(--unit) * 261);
}

/* A heading's diamond stands at the head's left, the words after it being undrawn for want of a key */
.diamond {
  position: absolute;
  top: calc(var(--unit) * 42.5);
  left: calc(var(--unit) * 33.5);
  width: calc(var(--unit) * 9);
  height: calc(var(--unit) * 9);
  background: #c9ccc4;
  rotate: 45deg;
}

/* Cards 120 units wide, 60 apart, from 58 units in */
.members {
  position: absolute;
  top: calc(var(--unit) * 79);
  left: calc(var(--unit) * 58);
  display: flex;
  gap: calc(var(--unit) * 60);
  margin: 0;
  padding: 0;
  list-style: none;
}

.pool {
  position: absolute;
  top: calc(var(--unit) * 593);
  right: calc(var(--unit) * 30);
  margin: 0;
  color: #cdd7cf;
  font-size: calc(var(--unit) * 32);
  font-weight: 600;
  line-height: calc(var(--unit) * 32);
  letter-spacing: calc(var(--unit) * 1.2);
  white-space: nowrap;
}

.amount {
  color: #84dc88;
}

/* The band behind the switch and the threshold, a shade darker than the glass around it */
.band,
.switch {
  position: absolute;
  top: calc(var(--unit) * 708);
  left: calc(var(--unit) * 1375);
  width: calc(var(--unit) * 537);
}

.band {
  height: calc(var(--unit) * 144);
  background: rgb(0 0 0 / 16%);
}

.switch {
  height: calc(var(--unit) * 80);
  padding: calc(var(--unit) * 7) 0 0;
  border: none;
  background: none;
  color: inherit;
  font: inherit;
  font-size: calc(var(--unit) * 26);
  font-weight: 600;
  line-height: calc(var(--unit) * 33);
  text-align: center;
}

.toggle {
  position: absolute;
  top: calc(var(--unit) * 27);
  right: calc(var(--unit) * 26);
  width: calc(var(--unit) * 68);
  height: calc(var(--unit) * 27);
  border-radius: calc(var(--unit) * 14);
  background: #153725;
}

.knob {
  position: absolute;
  top: 0;
  right: 0;
  width: calc(var(--unit) * 27);
  height: calc(var(--unit) * 27);
  border-radius: 50%;
  background: #8ffa95;
}

/* The check the knob holds, an L turned on its corner */
.knob::after {
  position: absolute;
  top: calc(var(--unit) * 8);
  left: calc(var(--unit) * 10.5);
  width: calc(var(--unit) * 6);
  height: calc(var(--unit) * 11);
  border: solid #fff;
  border-width: 0 calc(var(--unit) * 3) calc(var(--unit) * 3) 0;
  content: "";
  rotate: 45deg;
}

/* Off, the knob sits at the track's left, unlit and unchecked. The clip shows only the switch on, so this is provisional */
.toggle.off {
  background: #2a3a32;
}

.toggle.off .knob {
  right: auto;
  left: 0;
  background: #7d8a83;
}

.toggle.off .knob::after {
  display: none;
}

/* The threshold's two round buttons either side of its figure, the figure centred on the panel */
.step {
  --hover-duration: v-bind(INTERACTION_HOVER_DURATION);
  --state-duration: v-bind(INTERACTION_REST_DURATION);
  position: absolute;
  top: calc(var(--unit) * 798);
  width: calc(var(--unit) * 40);
  height: calc(var(--unit) * 40);
  padding: 0;
  border: none;
  border-radius: 50%;
  background: #d9ceb8;
  box-shadow: 0 0 calc(var(--unit) * 3) rgb(0 0 0 / 30%);
  outline: calc(var(--unit) * 1) solid transparent;
}

/* A threshold's round button lights a white ring when hovered or focused (`ringButton.css`), and a press dims it
   At once */
.step:is(:active, [data-pressed], [data-interaction-state="Pressed"] *) {
  --state-duration: 0s;
  filter: brightness(0.9);
}

.decrease {
  left: calc(var(--unit) * 1540);
}

.increase {
  left: calc(var(--unit) * 1708);
}

.step::before,
.increase::after {
  position: absolute;
  top: 50%;
  left: 50%;
  width: calc(var(--unit) * 18);
  height: calc(var(--unit) * 5);
  background: #3b3b3b;
  content: "";
  translate: -50% -50%;
}

.increase::after {
  rotate: 90deg;
}

.percent {
  position: absolute;
  top: calc(var(--unit) * 803);
  left: calc(var(--unit) * 1563);
  width: calc(var(--unit) * 161);
  color: #84dc88;
  font-size: calc(var(--unit) * 28);
  font-weight: 600;
  line-height: calc(var(--unit) * 30);
  text-align: center;
}

/* The game draws no Worship switch on this screen, so the button stays at the screen's bottom left, out of the panel */
.worship {
  position: absolute;
  bottom: calc(var(--unit) * 60);
  left: calc(var(--unit) * 60);
  padding: calc(var(--unit) * 8) calc(var(--unit) * 16);
  border: none;
  background: rgb(255 255 255 / 8%);
  color: inherit;
  font: inherit;
  font-size: calc(var(--unit) * 22);
}
</style>
