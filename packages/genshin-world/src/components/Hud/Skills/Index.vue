<script setup lang="ts">
import type { Input } from "genshin-engine";
import type { GameText } from "genshin-text";

import { ACTION_BUTTON_BACKGROUND } from "#src/services/hud/constants";
import { getActionKeyCode } from "#src/services/shared/getActionKeyCode";
import { InputAction } from "genshin-engine";
import { GameTextKey } from "genshin-text";

interface Props {
  // The member on the field's burst: the seconds left of its cooldown and its whole cooldown, its energy and its cost
  burstCooldown: number;
  burstCooldownSeconds: number;
  energy: number;
  energyCost: number;
  // The game's words in the reader's language
  gameText: GameText;
  input: Input;
  // Whether the main pointer is a finger, which lays the buttons out as the touch layout does, beside its action buttons
  isTouch: boolean;
  // The member on the field's skill: the seconds left of its cooldown and its whole cooldown
  skillCooldown: number;
  skillCooldownSeconds: number;
}

const {
  burstCooldown,
  burstCooldownSeconds,
  energy,
  energyCost,
  gameText,
  input,
  isTouch,
  skillCooldown,
  skillCooldownSeconds,
} = defineProps<Props>();
const skillCode = getActionKeyCode(InputAction.ElementalSkill);
const burstCode = getActionKeyCode(InputAction.ElementalBurst);
// The share of a cooldown left, none for a kit whose cooldown is no time at all, and all of it while more is left than the
// Kit's own, as a stance's end sets
const getCooldownShare = (secondsLeft: number, seconds: number) =>
  seconds > 0 ? Math.min(1, secondsLeft / seconds) : 0;
// Hidden with the HUD, the buttons let go of the keys they hold
onUnmounted(() => {
  input.release(skillCode);
  input.release(burstCode);
});
</script>

<template>
  <!-- The skill and burst buttons at the bottom right. A cooldown darkens its button by the share left and counts its
       Seconds down to a tenth, and the burst fills with its energy from the foot, lit once full.
       Pressing and holding one holds its key, as the touch controls hold theirs -->
  <div class="skills" :class="{ touch: isTouch }">
    <button
      class="skill"
      :aria-label="gameText[GameTextKey.ElementalSkill]"
      :style="{ '--cooldown': getCooldownShare(skillCooldown, skillCooldownSeconds) }"
      type="button"
      @pointercancel="input.release(skillCode)"
      @pointerdown="input.press(skillCode)"
      @pointerup="input.release(skillCode)"
    >
      <span v-if="skillCooldown > 0" class="cooldown">{{ skillCooldown.toFixed(1) }}</span>
    </button>
    <button
      class="burst"
      :class="{ ready: energy >= energyCost && burstCooldown <= 0 }"
      :aria-label="gameText[GameTextKey.ElementalBurst]"
      :style="{
        '--cooldown': getCooldownShare(burstCooldown, burstCooldownSeconds),
        '--energy': Math.min(energy / energyCost, 1),
      }"
      type="button"
      @pointercancel="input.release(burstCode)"
      @pointerdown="input.press(burstCode)"
      @pointerup="input.release(burstCode)"
    >
      <span v-if="burstCooldown > 0" class="cooldown">{{ burstCooldown.toFixed(1) }}</span>
    </button>
  </div>
</template>

<style scoped>
/* Provisional: the keys' layout, its buttons' sizes, places, colours, sweep and glow, and the skill's and burst's own
   Icons in place of these rings, measured off a recording of the English PC client's world HUD in a fight */
.skills {
  display: flex;
  align-items: flex-end;
  gap: calc(var(--unit) * 28);
}

.skill,
.burst {
  display: grid;
  place-items: center;
  padding: 0;
  border: calc(var(--unit) * 3) solid rgb(236 229 216 / 0.85);
  border-radius: 50%;
  background: conic-gradient(rgb(0 0 0 / 0.55) calc(var(--cooldown) * 1turn), rgb(23 29 41 / 0.45) 0);
  color: #fff;
  cursor: inherit;
  font: inherit;
  pointer-events: auto;
  touch-action: none;
}

.skill {
  width: calc(var(--unit) * 76);
  height: calc(var(--unit) * 76);
}

.burst {
  width: calc(var(--unit) * 104);
  height: calc(var(--unit) * 104);
  background:
    conic-gradient(rgb(0 0 0 / 0.55) calc(var(--cooldown) * 1turn), transparent 0),
    linear-gradient(to top, rgb(255 214 120 / 0.8) calc(var(--energy) * 100%), rgb(23 29 41 / 0.45) 0);
}

.ready {
  box-shadow: 0 0 calc(var(--unit) * 16) rgb(255 214 120 / 0.9);
}

/* The touch layout's skill and burst as `hud-world-pickup` shows them, each a disc as the action buttons' are, measured
   In that recording's pixels from the right edge and the foot of `GrpActionBtn` at 1080 / 934 units a pixel: the
   Skill's of radius 61 centred 482.6 in and 129 up, and the burst's of radius 44.5 at 629.1 in and 93.5 up. Provisional:
   Each one's own icon, the character's, and the burst's fill, drawn in the gold of the keys' layout where the game fills
   With the element's colour */
.touch .skill,
.touch .burst {
  position: absolute;
  border: none;
}

.touch .skill {
  right: calc(var(--unit) * 487.5);
  bottom: calc(var(--unit) * 78.6);
  width: calc(var(--unit) * 141.1);
  height: calc(var(--unit) * 141.1);
  background: conic-gradient(rgb(0 0 0 / 0.55) calc(var(--cooldown) * 1turn), v-bind(ACTION_BUTTON_BACKGROUND) 0);
}

.touch .burst {
  right: calc(var(--unit) * 676);
  bottom: calc(var(--unit) * 56.7);
  width: calc(var(--unit) * 102.9);
  height: calc(var(--unit) * 102.9);
  background:
    conic-gradient(rgb(0 0 0 / 0.55) calc(var(--cooldown) * 1turn), transparent 0),
    linear-gradient(to top, rgb(255 214 120 / 0.8) calc(var(--energy) * 100%), v-bind(ACTION_BUTTON_BACKGROUND) 0);
}

.cooldown {
  font-size: calc(var(--unit) * 26);
  font-weight: 600;
  text-shadow: 0 0 calc(var(--unit) * 3) rgb(0 0 0 / 0.8);
}
</style>
