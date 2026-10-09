<script setup lang="ts">
import type { GlyphLayer } from "#src/models/hud/GlyphLayer";
import type { Input } from "genshin-engine";
import type { GameText } from "genshin-text";

import { WeaponType } from "#src/models/weapon/WeaponType";
import { ACTION_BUTTON_BACKGROUND } from "#src/services/hud/constants";
import { InputActionGlyphLayersMap } from "#src/services/hud/InputActionGlyphLayersMap";
import { WeaponTypeGlyphLayersMap } from "#src/services/hud/WeaponTypeGlyphLayersMap";
import { getActionKeyCode } from "#src/services/shared/getActionKeyCode";
import { InputAction } from "genshin-engine";
import { GameTextKey } from "genshin-text";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
  input: Input;
  // The kind of weapon the member on the field wields, whose normal attack's glyph the attack button carries and which
  // Gives a bow's wielder the aim button, none while the member on the field is unknown
  weaponType?: WeaponType;
}

const { gameText, input, weaponType } = defineProps<Props>();
const attackCode = getActionKeyCode(InputAction.NormalAttack);
const aimCode = getActionKeyCode(InputAction.Aim);
const jumpCode = getActionKeyCode(InputAction.Jump);
const sprintCode = getActionKeyCode(InputAction.Sprint);
// Each button in the order a reader tabs through them: the key it holds, its glyph's layers, its name in the game's words
// And the class that places it
const buttons = computed<{ code: string; glyphLayers: readonly GlyphLayer[]; label: string; name: string }[]>(() => [
  {
    code: attackCode,
    glyphLayers: weaponType ? WeaponTypeGlyphLayersMap[weaponType] : [],
    label: gameText[GameTextKey.NormalAttack],
    name: "attack",
  },
  ...(weaponType === WeaponType.Bow
    ? [
        {
          code: aimCode,
          glyphLayers: InputActionGlyphLayersMap[InputAction.Aim],
          label: gameText[GameTextKey.SwitchAimingMode],
          name: "aim",
        },
      ]
    : []),
  {
    code: jumpCode,
    glyphLayers: InputActionGlyphLayersMap[InputAction.Jump],
    label: gameText[GameTextKey.Jump],
    name: "jump",
  },
  {
    code: sprintCode,
    glyphLayers: InputActionGlyphLayersMap[InputAction.Sprint],
    label: gameText[GameTextKey.Sprint],
    name: "sprint",
  },
]);
// The aim button leaves with the bow, so a switch to a member wielding another kind lets go of the aim it may hold
watch(
  () => weaponType === WeaponType.Bow,
  (isBow) => {
    if (!isBow) input.release(aimCode);
  },
);
// Hidden with the HUD, the buttons let go of the keys they hold
onUnmounted(() => {
  for (const code of [attackCode, aimCode, jumpCode, sprintCode]) input.release(code);
});
</script>

<template>
  <!-- The touch layout's action buttons at the bottom right beside the skill and the burst: the normal attack carrying its
       Weapon's glyph, the aim a bow's wielder has, the jump and the sprint, each holding its action's key while pressed,
       So a press passes the same checks as the key -->
  <button
    v-for="{ code, glyphLayers, label, name } of buttons"
    :key="name"
    :class="['action', name]"
    :aria-label="label"
    type="button"
    @pointercancel="input.release(code)"
    @pointerdown="input.press(code)"
    @pointerup="input.release(code)"
  >
    <svg class="glyph" aria-hidden="true" viewBox="0 0 128 128">
      <path
        v-for="{ opacity, path } of glyphLayers"
        :key="path"
        fill-rule="evenodd"
        :fill-opacity="opacity"
        :d="path"
      />
    </svg>
  </button>
</template>

<style scoped>
/* Each disc and glyph as `hud-world-pickup` shows the touch layout, measured in that recording's pixels from the right
   Edge and the foot of `GrpActionBtn`, the rect the buttons hang in, at 1080 / 934 units a pixel: the attack's disc of
   Radius 82 centred 324.6 in and 218 up, the jump's and the sprint's of radius 61 at 166.6 in and 321 and 129 up, and the
   Aim's of radius 37 at 539.6 in and 235 up. Each glyph's square is centred on its disc, its side read off the glyph's
   Box against its icon's: the attack's the disc's own, the jump's 1.26 and the sprint's 0.985 of its icon's 128 pixels,
   And the aim's the 54 pixels it was measured in */
.action {
  position: absolute;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: v-bind(ACTION_BUTTON_BACKGROUND);
  cursor: inherit;
  pointer-events: auto;
  touch-action: none;
}

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

.attack {
  --glyph-size: calc(var(--unit) * 189.6);
  right: calc(var(--unit) * 280.5);
  bottom: calc(var(--unit) * 157.3);
  width: calc(var(--unit) * 189.6);
  height: calc(var(--unit) * 189.6);
}

.aim {
  --glyph-size: calc(var(--unit) * 62.4);
  right: calc(var(--unit) * 581.2);
  bottom: calc(var(--unit) * 229);
  width: calc(var(--unit) * 85.6);
  height: calc(var(--unit) * 85.6);
}

.jump,
.sprint {
  right: calc(var(--unit) * 122.1);
  width: calc(var(--unit) * 141.1);
  height: calc(var(--unit) * 141.1);
}

.jump {
  --glyph-size: calc(var(--unit) * 186.5);
  bottom: calc(var(--unit) * 300.6);
}

.sprint {
  --glyph-size: calc(var(--unit) * 145.8);
  bottom: calc(var(--unit) * 78.6);
}
</style>
