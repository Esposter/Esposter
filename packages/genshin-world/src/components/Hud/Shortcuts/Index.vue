<script setup lang="ts">
import type { Input } from "genshin-engine";
import type { GameText } from "genshin-text";

import { HUD_SHORTCUTS } from "#src/services/hud/constants";
import { MenuEntryGlyphMap } from "#src/services/menu/MenuEntryGlyphMap";
import { tapActionKey } from "#src/services/shared/tapActionKey";

interface Props {
  // The game's words in the reader's language, which name each shortcut for a screen reader
  gameText: GameText;
  input: Input;
}

const { gameText, input } = defineProps<Props>();
const shortcuts = HUD_SHORTCUTS.map(({ icon, inputAction, labelKey }) => ({
  glyph: MenuEntryGlyphMap[icon],
  inputAction,
  labelKey,
}));
</script>

<template>
  <!-- The top right's shortcuts the world backs, a row against the right of the game's panel for them: each the Paimon
       Menu's icon for its screen, which a press opens as its key does, named for a screen reader since it shows an icon
       Alone -->
  <ul class="shortcuts">
    <li v-for="{ glyph, inputAction, labelKey } of shortcuts" :key="inputAction">
      <button class="shortcut" type="button" :aria-label="gameText[labelKey]" @click="tapActionKey(input, inputAction)">
        <svg
          class="glyph"
          aria-hidden="true"
          :style="{ '--glyph-height': glyph.height, '--glyph-width': glyph.width }"
          :viewBox="`0 0 ${glyph.width} ${glyph.height}`"
        >
          <path v-for="(path, index) of glyph.paths" :key="index" :d="path" />
        </svg>
      </button>
    </li>
  </ul>
</template>

<style scoped>
/* Measured off `hud-world-keys` at 1080 high and `hud-world-pickup` at 934, which agree in canvas units: a shortcut
   Every 76, the last centred 59 in from the panel's right and each 40 down, the middle of the panel's 80 */
.shortcuts {
  display: flex;
  height: 100%;
  justify-content: flex-end;
  padding: 0 calc(var(--canvas-unit) * 21) 0 0;
  margin: 0;
  list-style: none;
}

.shortcut {
  display: grid;
  width: calc(var(--canvas-unit) * 76);
  height: 100%;
  padding: 0;
  border: none;
  background: none;
  color: #fff;
  cursor: inherit;
  place-items: center;
  pointer-events: auto;
}

/* Each icon the menu's trace at 0.585 of a pixel of the 1920 by 1080 screen to a pixel of the menu's 2560 wide
   Reference, as the two stills' icons measure against the traces. Provisional: the faint shadow round it, by eye */
.glyph {
  width: calc(var(--unit) * 0.585 * var(--glyph-width));
  height: calc(var(--unit) * 0.585 * var(--glyph-height));
  fill: currentColor;
  filter: drop-shadow(0 0 calc(var(--unit) * 3) rgb(0 0 0 / 0.3));
}
</style>
