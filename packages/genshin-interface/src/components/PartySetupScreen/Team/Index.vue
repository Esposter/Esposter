<script setup lang="ts">
import type { PartySetupSlot } from "#src/models/PartySetupSlot";

import GameButton from "#src/components/GameButton/Index.vue";
import PartySetupScreenTeamMember from "#src/components/PartySetupScreen/Team/Member/Index.vue";
import { GameButtonKind } from "#src/models/GameButtonKind";

interface Props {
  // The words of the arrows in the reader's language: the party the next arrow steps to, and the one the previous arrow steps to
  nextLabel: string;
  previousLabel: string;
  // The team on the screen: its four slots in slot order
  slots: PartySetupSlot[];
}

const { nextLabel, previousLabel } = defineProps<Props>();
const emit = defineEmits<{ next: []; previous: [] }>();
// The two arrows step the team either way: one arrow's markup, drawn once, and the next arrow mirrors it by its class
const steps = computed(() => [
  { label: previousLabel, name: "previous" as const },
  { label: nextLabel, name: "next" as const },
]);
</script>

<template>
  <section class="team">
    <GameButton
      v-for="step of steps"
      :key="step.name"
      :aria-label="step.label"
      :class="['step', step.name]"
      :kind="GameButtonKind.Disc"
      tip=""
      @click="step.name === 'previous' ? emit('previous') : emit('next')"
    >
      <svg viewBox="54 514 40 52" aria-hidden="true">
        <path class="chevron" d="M58.5 540 80.5 520.5v7l-10.5 12.5 10.5 12.5v8z" />
        <path class="ornament" d="M71 540 81 530l9 10-9 10z" />
      </svg>
    </GameButton>
    <ol class="slots">
      <li v-for="(slot, index) of slots" :key="index" class="slot">
        <PartySetupScreenTeamMember :member="slot" />
      </li>
    </ol>
  </section>
</template>

<style scoped>
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
  margin-left: calc(var(--unit) * 12);
}

.slot:nth-child(4) .plate {
  top: calc(var(--unit) * 216);
}
</style>
