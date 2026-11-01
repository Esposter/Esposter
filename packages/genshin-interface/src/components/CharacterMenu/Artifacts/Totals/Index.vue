<script setup lang="ts">
import type { ArtifactSetBonusGroup } from "#src/models/ArtifactSetBonusGroup";
import type { ArtifactStatLine } from "#src/models/ArtifactStatLine";

interface Props {
  // The words the set bonus block shows while no bonus is active
  noSetBonusLabel: string;
  // The set bonus block's heading, the game's word for its bonuses
  setBonusHeading: string;
  // Each set the worn artifacts make, its name and its bonuses' lines in the game's words, empty while none is active
  sets: ArtifactSetBonusGroup[];
  // The attribute totals the worn artifacts add, each as the game writes it
  totals: ArtifactStatLine[];
}

defineProps<Props>();
</script>

<template>
  <!-- The worn artifacts' attribute totals down the panel's top, the set bonus block under them -->
  <ul class="totals">
    <li v-for="{ label, value } in totals" :key="label" class="total">
      <span>{{ label }}</span>
      <span>{{ value }}</span>
    </li>
  </ul>
  <div class="set-bonus">
    <p class="set-bonus-heading">{{ setBonusHeading }}</p>
    <template v-if="sets.length > 0">
      <div v-for="({ lines, name }, index) in sets" :key="index">
        <p v-if="name" class="set-name">{{ name }}</p>
        <ul class="set-bonus-lines">
          <li v-for="line in lines" :key="line">
            <svg class="check" viewBox="0 0 20 20" aria-hidden="true">
              <circle cx="10" cy="10" r="10" />
              <path d="M5.5 10.5 L8.5 13.5 L14.5 7" />
            </svg>
            {{ line }}
          </li>
        </ul>
      </div>
    </template>
    <p v-else class="set-bonus-lines">{{ noSetBonusLabel }}</p>
  </div>
</template>

<style scoped>
.totals {
  top: calc(var(--unit) * 0.7);
}

/* The block ends 88 units above the panel's foot, where the game's text is cut off under the pills */
.set-bonus {
  position: absolute;
  top: calc(var(--unit) * 222.4);
  right: calc(var(--unit) * 16);
  bottom: calc(var(--unit) * 88);
  left: 0;
  overflow: hidden;
  color: #a8ff8e;
}

.set-bonus-heading,
.set-name,
.set-bonus-lines {
  margin: 0;
  padding: 0;
  list-style: none;
}

/* The face is Signika, narrower than the game's at the same cap height, so each line is spaced out to the game's width */
.set-bonus-heading {
  font-size: calc(var(--unit) * 26);
  font-weight: 600;
  letter-spacing: calc(var(--unit) * 1.1);
  line-height: calc(var(--unit) * 30);
}

.set-name {
  margin-top: calc(var(--unit) * 14.1);
  font-size: calc(var(--unit) * 27);
  font-weight: 600;
  letter-spacing: calc(var(--unit) * 1.3);
  line-height: calc(var(--unit) * 28.9);
}

.set-bonus-lines {
  margin-top: calc(var(--unit) * 1.9);
  font-size: calc(var(--unit) * 23.5);
  letter-spacing: calc(var(--unit) * 0.66);
  line-height: calc(var(--unit) * 24.4);
}

.set-bonus-lines li {
  position: relative;
  padding-left: calc(var(--unit) * 21.4);
}

.check {
  position: absolute;
  top: calc(var(--unit) * 2.4);
  left: 0;
  width: calc(var(--unit) * 19.5);
  height: calc(var(--unit) * 19.5);
}

.check circle {
  fill: #61bf55;
}

.check path {
  fill: none;
  stroke: #fff;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2.2;
}
</style>

<style scoped src="../../../../styles/artifactStats.css"></style>
