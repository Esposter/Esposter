<script setup lang="ts">
import type { Element } from "#src/models/Element";
import type { SkillGlyphs } from "#src/models/hud/SkillGlyphs";
import type { Input } from "genshin-engine";
import type { GameText } from "genshin-text";

import HudGlyph from "#src/components/Hud/Glyph/Index.vue";
import HudKeyCap from "#src/components/Hud/KeyCap/Index.vue";
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
  // The member on the field's skill and burst icons, which the buttons carry, none until its kit is read or for a
  // Character the hosted icons lack, whose buttons stay bare
  skillGlyphs?: SkillGlyphs;
}

const {
  burstCooldown,
  burstCooldownSeconds,
  element,
  energy,
  energyCost,
  gameText,
  input,
  isTouch,
  skillCooldown,
  skillCooldownSeconds,
  skillGlyphs,
} = defineProps<Props>();
const skillCode = getActionKeyCode(InputAction.ElementalSkill);
const burstCode = getActionKeyCode(InputAction.ElementalBurst);
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
       Colour, its icon dim until the whole disc is in that colour once full. The keys' layout caps each with its key.
       Pressing and holding one holds its key, as the touch controls hold theirs, and Enter or Space holds a focused one's,
       Stopped before the world's own keys hear them -->
  <div class="skills" :class="isTouch ? 'touch' : 'keys'">
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
    <template v-if="!isTouch">
      <HudKeyCap class="key skill-key" :code="skillCode" />
      <HudKeyCap class="key burst-key" :code="burstCode" />
    </template>
  </div>
</template>

<style scoped>
.skill,
.burst {
  position: absolute;
  display: grid;
  place-items: center;
  padding: 0;
  border: none;
  border-radius: 50%;
  color: #fff;
  cursor: inherit;
  font: inherit;
  pointer-events: auto;
  touch-action: none;
}

/* The burst's icon is white at 0.14 over its disc until charged, as `hud-world-pickup` shows it at 24% energy */
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
}

/* Charged, the disc is its element's charged tone, haloed in half its bright one, as `hud-world-keys` shows the halo
   Some 16 wide and faint */
.burst.ready {
  box-shadow: 0 0 calc(var(--unit) * 16) color-mix(in srgb, var(--burst-bright, #fff) 50%, transparent);
}

/* The keys' skill and burst as `hud-world-keys` shows them at 1080 high, measured from the right edge and the foot of
   `GrpActionBtn`, which on a 16:9 screen are the screen's: the skill's disc of diameter 74 centred 228.5 in and 92 up,
   Darkening what lies under it by a quarter, and the burst's of diameter 112 at 101 in and 109.5 up, ringed 6 wide in
   Its element's bright tone once charged. Under each its key's cap, 30 by 25 and white, 28.5 up. Each icon's
   Square is 1.29 of the skill's disc and 1.066 of the burst's, Chonghua's Layered Frost's white 36 by 58 pixels against
   Its icon's 47 by 80 and Cloud-Parting Star's 77 by 77 against its icon's 82 by 83. Provisional: the uncharged burst,
   Which no frame of the keys shows, drawn as the skill's disc filling as the touch layout's does */
.keys .skill {
  --glyph-size: calc(var(--unit) * 74 * 1.29);

  right: calc(var(--unit) * 191.5);
  bottom: calc(var(--unit) * 55);
  width: calc(var(--unit) * 74);
  height: calc(var(--unit) * 74);
  background: conic-gradient(rgb(0 0 0 / 0.55) calc(var(--cooldown) * 1turn), rgb(0 0 0 / 0.26) 0);
}

.keys .burst {
  --glyph-size: calc(var(--unit) * 112 * 1.066);

  right: calc(var(--unit) * 45);
  bottom: calc(var(--unit) * 53.5);
  width: calc(var(--unit) * 112);
  height: calc(var(--unit) * 112);
  background:
    conic-gradient(rgb(0 0 0 / 0.55) calc(var(--cooldown) * 1turn), transparent 0),
    linear-gradient(to top, var(--burst-fill) calc(var(--energy) * 100%), rgb(0 0 0 / 0.26) 0);
}

.keys .burst.ready {
  border: calc(var(--unit) * 6) solid var(--burst-bright, #fff);
  background: var(--burst-charged, #fff);
}

.key {
  position: absolute;
  bottom: calc(var(--unit) * 28.5);
}

.skill-key {
  right: calc(var(--unit) * 213.5);
}

.burst-key {
  right: calc(var(--unit) * 86.5);
}

/* The touch layout's skill and burst as `hud-world-pickup` shows them, each a disc as the action buttons' are, measured
   In that recording's pixels from the right edge and the foot of `GrpActionBtn` at 864 / 934 units a pixel, as the
   Action buttons are: the skill's of radius 61 centred 466.9 in and 129 up, and the burst's of radius 44.5 at 613.4 in
   And 93.5 up. Each icon's
   Square is 1.355 of the skill's disc and 1.048 of the burst's, Skyward Sonnet's 84 by 90 pixel mark being 65 by 70 of
   Its icon's 128 and Wind's Grand Ode's inner circle 37.5 pixels across against its icon's 51.5 */
.touch .skill {
  --glyph-size: calc(var(--unit) * 112.9 * 1.355);

  right: calc(var(--unit) * 375.5);
  bottom: calc(var(--unit) * 62.9);
  width: calc(var(--unit) * 112.9);
  height: calc(var(--unit) * 112.9);
  background: conic-gradient(rgb(0 0 0 / 0.55) calc(var(--cooldown) * 1turn), v-bind(ACTION_BUTTON_BACKGROUND) 0);
}

.touch .burst {
  --glyph-size: calc(var(--unit) * 82.3 * 1.048);

  right: calc(var(--unit) * 526.2);
  bottom: calc(var(--unit) * 45.3);
  width: calc(var(--unit) * 82.3);
  height: calc(var(--unit) * 82.3);
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
