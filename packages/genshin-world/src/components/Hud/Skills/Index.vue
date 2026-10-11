<script setup lang="ts">
import type { Element } from "#src/models/Element";
import type { Input } from "genshin-engine";
import type { GameText } from "genshin-text";

import HudGlyph from "#src/components/Hud/Glyph/Index.vue";
import { CharacterIdSkillGlyphsMap } from "#src/services/hud/CharacterIdSkillGlyphsMap";
import { ACTION_BUTTON_BACKGROUND } from "#src/services/hud/constants";
import { ElementBurstColorsMap } from "#src/services/hud/ElementBurstColorsMap";
import { pressCapturedPointer } from "#src/services/hud/pressCapturedPointer";
import { getActionKeyCode } from "#src/services/shared/getActionKeyCode";
import { InputAction } from "genshin-engine";
import { GameTextKey } from "genshin-text";

interface Props {
  // The member on the field's burst: the seconds left of its cooldown and its whole cooldown, its energy and its cost
  burstCooldown: number;
  burstCooldownSeconds: number;
  // The member on the field, whose skill and burst icons the buttons carry
  characterId: number;
  // The element the burst's fill and charged disc are coloured in, none for a member the roster's table gives none
  element?: Element;
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
  characterId,
  element,
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
const skillGlyphs = computed(() => CharacterIdSkillGlyphsMap[characterId]);
const burstColors = computed(() => (element === undefined ? undefined : ElementBurstColorsMap[element]));
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
       Seconds down to a tenth, each carries its icon, and the burst fills with its energy from the foot in its element's
       Colour, its icon dim until the whole disc is in that colour once full.
       Pressing and holding one holds its key, as the touch controls hold theirs, and Enter or Space holds a focused one's,
       Stopped before the world's own keys hear them -->
  <div class="skills" :class="{ touch: isTouch }">
    <button
      class="skill"
      :aria-label="gameText[GameTextKey.ElementalSkill]"
      :style="{ '--cooldown': getCooldownShare(skillCooldown, skillCooldownSeconds) }"
      type="button"
      @blur="input.release(skillCode)"
      @keydown.enter.space.stop="input.press(skillCode)"
      @keyup.enter.space.stop="input.release(skillCode)"
      @lostpointercapture="input.release(skillCode)"
      @pointerdown="(event) => pressCapturedPointer(input, skillCode, event)"
    >
      <HudGlyph v-if="skillGlyphs" class="glyph" :glyph-layers="skillGlyphs.skill" />
      <span v-if="skillCooldown > 0" class="cooldown">{{ skillCooldown.toFixed(1) }}</span>
    </button>
    <button
      class="burst"
      :class="{ ready: energy >= energyCost && burstCooldown <= 0 }"
      :aria-label="gameText[GameTextKey.ElementalBurst]"
      :style="{
        '--burst-bright': burstColors?.bright,
        '--burst-charged': burstColors?.charged,
        '--cooldown': getCooldownShare(burstCooldown, burstCooldownSeconds),
        '--energy': Math.min(energy / energyCost, 1),
      }"
      type="button"
      @blur="input.release(burstCode)"
      @keydown.enter.space.stop="input.press(burstCode)"
      @keyup.enter.space.stop="input.release(burstCode)"
      @lostpointercapture="input.release(burstCode)"
      @pointerdown="(event) => pressCapturedPointer(input, burstCode, event)"
    >
      <HudGlyph v-if="skillGlyphs" class="glyph" :glyph-layers="skillGlyphs.burst" />
      <span v-if="burstCooldown > 0" class="cooldown">{{ burstCooldown.toFixed(1) }}</span>
    </button>
  </div>
</template>

<style scoped>
/* Provisional: the keys' layout, its buttons' sizes, places, colours, sweep and glow, measured off a recording of the
   English PC client's world HUD in a fight */
.skills {
  --skill-glyph-share: 1.355;
  --burst-glyph-share: 1.048;

  display: flex;
  align-items: flex-end;
  gap: calc(var(--unit) * 28);
}

.skill,
.burst {
  position: relative;
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
  --glyph-size: calc(var(--unit) * 76 * var(--skill-glyph-share));

  width: calc(var(--unit) * 76);
  height: calc(var(--unit) * 76);
}

/* Each icon's square is centred on its disc, its side a share of the disc's measured in `hud-world-pickup` from the
   Mark's box against its icon's: the skill's 1.355, Skyward Sonnet's 84 by 90 pixel mark being 65 by 70 of its icon's
   128, and the burst's 1.048, Wind's Grand Ode's inner circle 37.5 pixels across against its icon's 51.5. The burst's
   Icon is white at 0.14 over its disc until charged, as that recording shows it at 24% energy */
.glyph {
  position: absolute;
  top: 50%;
  left: 50%;
  width: var(--glyph-size);
  height: var(--glyph-size);
  fill: #fff;
  pointer-events: none;
  translate: -50% -50%;
}

.burst .glyph {
  opacity: 0.14;
}

.burst.ready .glyph {
  opacity: 1;
}

/* The burst's fill rises in its element's bright tone at a third over the disc, the share `ElementBurstColorsMap` was
   Solved at, and a member with no element fills in white */
.burst {
  --burst-fill: color-mix(in srgb, var(--burst-bright, #fff) 33%, transparent);
  --glyph-size: calc(var(--unit) * 104 * var(--burst-glyph-share));

  width: calc(var(--unit) * 104);
  height: calc(var(--unit) * 104);
  background:
    conic-gradient(rgb(0 0 0 / 0.55) calc(var(--cooldown) * 1turn), transparent 0),
    linear-gradient(to top, var(--burst-fill) calc(var(--energy) * 100%), rgb(23 29 41 / 0.45) 0);
}

/* Charged, the disc is its element's charged tone, ringed and lit in its bright one */
.burst.ready {
  border-color: var(--burst-bright, #fff);
  background: var(--burst-charged, #fff);
  box-shadow: 0 0 calc(var(--unit) * 16) var(--burst-bright, #fff);
}

/* The touch layout's skill and burst as `hud-world-pickup` shows them, each a disc as the action buttons' are, measured
   In that recording's pixels from the right edge and the foot of `GrpActionBtn` at 1080 / 934 units a pixel: the
   Skill's of radius 61 centred 482.6 in and 129 up, and the burst's of radius 44.5 at 629.1 in and 93.5 up. Provisional:
   Each one's own icon, the character's */
.touch .skill,
.touch .burst {
  position: absolute;
  border: none;
}

.touch .skill {
  --glyph-size: calc(var(--unit) * 141.1 * var(--skill-glyph-share));

  right: calc(var(--unit) * 487.5);
  bottom: calc(var(--unit) * 78.6);
  width: calc(var(--unit) * 141.1);
  height: calc(var(--unit) * 141.1);
  background: conic-gradient(rgb(0 0 0 / 0.55) calc(var(--cooldown) * 1turn), v-bind(ACTION_BUTTON_BACKGROUND) 0);
}

.touch .burst {
  --glyph-size: calc(var(--unit) * 102.9 * var(--burst-glyph-share));

  right: calc(var(--unit) * 676);
  bottom: calc(var(--unit) * 56.7);
  width: calc(var(--unit) * 102.9);
  height: calc(var(--unit) * 102.9);
  background:
    conic-gradient(rgb(0 0 0 / 0.55) calc(var(--cooldown) * 1turn), transparent 0),
    linear-gradient(to top, var(--burst-fill) calc(var(--energy) * 100%), v-bind(ACTION_BUTTON_BACKGROUND) 0);
}

.touch .burst.ready {
  background: var(--burst-charged, #fff);
}

/* Above the icon, a grid item's stacking order lifting it over the icon's absolute box */
.cooldown {
  z-index: 1;
  font-size: calc(var(--unit) * 26);
  font-weight: 600;
  text-shadow: 0 0 calc(var(--unit) * 3) rgb(0 0 0 / 0.8);
}
</style>
