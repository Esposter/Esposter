<script setup lang="ts">
import GameButton from "#src/components/GameButton/Index.vue";
import { GameButtonKind } from "#src/models/GameButtonKind";

interface Props {
  // The words of the Configure Team and Deploy buttons, and of Quick Setup, in the reader's language
  configureTeamLabel: string;
  deployLabel: string;
  quickSetupLabel: string;
  // The team's name, which the foot shows beside the Configure Team button
  teamName: string;
}

const { configureTeamLabel, deployLabel, quickSetupLabel, teamName } = defineProps<Props>();
const emit = defineEmits<{ configureTeam: []; deploy: []; quickSetup: [] }>();
</script>

<template>
  <footer class="foot">
    <GameButton
      class="configure foot-disc"
      :aria-label="configureTeamLabel"
      :kind="GameButtonKind.Disc"
      tip=""
      @click="emit('configureTeam')"
    />
    <p class="team-name">{{ teamName }}</p>
    <button class="quick cream-pill-button" type="button" @click="emit('quickSetup')">{{ quickSetupLabel }}</button>
    <GameButton class="deploy" :kind="GameButtonKind.Row" tip="" @click="emit('deploy')">{{ deployLabel }}</GameButton>
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
</template>

<style scoped src="../../../styles/creamPillButton.css"></style>

<style scoped>
.foot {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.foot button {
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
  top: calc(var(--unit) * 995);
  left: calc(var(--unit) * 50);
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
  isolation: isolate;
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

<style scoped src="../../../styles/footDisc.css"></style>
