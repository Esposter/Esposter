<script setup lang="ts">
import GameButton from "#src/components/GameButton/Index.vue";
import { GameButtonKind } from "#src/models/GameButtonKind";
import { INTERACTION_HOVER_DURATION, INTERACTION_REST_DURATION } from "#src/services/constants";

interface Props {
  // The label under the auto-recover switch, in the reader's language
  autoRecoverLabel: string;
  // Whether auto-recover's switch is on
  isAutoRecoverOn: boolean;
  // The Restorative Power the pool holds now, and the most it holds
  poolAmount: number;
  // The label before the pool's amount
  poolLabel: string;
  poolMaximum: number;
  // The percentage of a member's Max HP auto-recover heals it up to
  thresholdPercent: number;
}

defineProps<Props>();
const emit = defineEmits<{ stepThreshold: [direction: -1 | 1]; toggleAutoRecover: [] }>();
</script>

<template>
  <p class="pool">
    <span class="pool-label">{{ poolLabel }}</span>
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
    <span class="switch-label">{{ autoRecoverLabel }}</span>
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
</template>

<style scoped src="../../../styles/ringButton.css"></style>

<style scoped>
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

/* The words in the game's white heading face, which the pool's label and the switch's label are set in */
.pool-label,
.switch-label {
  color: #e5e7e1;
  font-size: calc(var(--unit) * 28);
  font-weight: 600;
}

/* The pool's label, tracked and spaced from the amount to the reference's width and place */
.pool-label {
  margin-right: calc(var(--unit) * 7.5);
  letter-spacing: calc(var(--unit) * 2.4);
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

/* The switch's label, two lines centred on the switch's width with the toggle at its right, tracked and raised to the
   reference's width and lines */
.switch-label {
  display: block;
  width: calc(var(--unit) * 290);
  margin: calc(var(--unit) * -1.3) auto 0;
  letter-spacing: calc(var(--unit) * 1.7);
  line-height: calc(var(--unit) * 31.5);
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
   at once */
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
  pointer-events: none;
  text-align: center;
}
</style>
