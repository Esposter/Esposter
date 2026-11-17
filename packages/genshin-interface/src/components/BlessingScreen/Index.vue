<script setup lang="ts">
import AutoRecover from "#src/components/BlessingScreen/AutoRecover/Index.vue";
import Member from "#src/components/BlessingScreen/Member/Index.vue";
import Team from "#src/components/BlessingScreen/Team/Index.vue";
import CloseButton from "#src/components/CloseButton/Index.vue";
import GameButton from "#src/components/GameButton/Index.vue";
import { BlessingMark } from "#src/models/BlessingMark";
import { CloseButtonMark } from "#src/models/CloseButtonMark";
import { GameButtonKind } from "#src/models/GameButtonKind";
import { BlessingMarkPathMap } from "#src/services/BlessingMarkPathMap";

interface BlessingMember {
  // The share of the member's Max HP it holds, which its health bar shows
  healthShare: number;
  id: number;
  // The member's level as the game writes it, when the host knows it
  levelText?: string | undefined;
  // The member's name in the reader's language
  name: string;
}

interface Props {
  // The label under the auto-recover switch, in the reader's language
  autoRecoverLabel: string;
  // The way out of the screen in the reader's language
  closeLabel: string;
  // The hint beside the deployed team's heading: a click on a member's portrait restores its HP
  healHint: string;
  // The heading over the deployed team, which the game lists as in combat
  inCombatLabel: string;
  // Whether auto-recover's switch is on
  isAutoRecoverOn: boolean;
  // The members of the deployed team, which the game lists as in combat
  members: BlessingMember[];
  // The Restorative Power the pool holds now, and the most it holds
  poolAmount: number;
  // The label before the pool's amount
  poolLabel: string;
  poolMaximum: number;
  // The heading over the teams not deployed
  preparingLabel: string;
  // The percentage of a member's Max HP auto-recover heals it up to
  thresholdPercent: number;
  // The title the game shows at the top of its panel, and the title of the Worship screen the screen switches to
  title: string;
  // The members of the teams not deployed, which the game lists as preparing for combat
  waitingMembers?: BlessingMember[] | undefined;
  worshipTitle: string;
}

const { waitingMembers = [] } = defineProps<Props>();
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
       pool, the auto-recover switch and its threshold in a panel down the right. The art the game ships is not
       drawn -->
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
        <path v-for="d of BlessingMarkPathMap[BlessingMark.Drop]" :key="d" fill-rule="evenodd" :d />
      </g>
    </svg>
    <Team :heading="inCombatLabel" :hint="healHint">
      <ul class="members">
        <li v-for="{ healthShare, id, levelText, name } of members" :key="id">
          <Member :health-share :level-text :name @heal="emit('heal', id)" />
        </li>
      </ul>
    </Team>
    <Team v-if="waitingMembers.length" is-waiting :heading="preparingLabel">
      <ul class="members">
        <li v-for="{ healthShare, id, levelText, name } of waitingMembers" :key="id">
          <Member :health-share :level-text :name @heal="emit('heal', id)" />
        </li>
      </ul>
    </Team>
    <svg class="statue" viewBox="0 0 150 174" aria-hidden="true">
      <path v-for="d of BlessingMarkPathMap[BlessingMark.Statue]" :key="d" fill="#82da74" fill-rule="evenodd" :d />
    </svg>
    <p class="title" role="heading" aria-level="1">{{ title }}</p>
    <CloseButton class="close" :label="closeLabel" :mark="CloseButtonMark.Cross" @click="emit('close')" />
    <AutoRecover
      :auto-recover-label
      :is-auto-recover-on
      :pool-amount
      :pool-label
      :pool-maximum
      :threshold-percent
      @step-threshold="(direction) => emit('stepThreshold', direction)"
      @toggle-auto-recover="emit('toggleAutoRecover')"
    />
    <GameButton class="worship" :kind="GameButtonKind.Row" tip="" @click="emit('worship')">{{
      worshipTitle
    }}</GameButton>
  </div>
</template>

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
