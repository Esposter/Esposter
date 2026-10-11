<script setup lang="ts">
import type { InteractionState } from "genshin-interface";
import type { GameText } from "genshin-text";

import MenuGlyph from "#src/components/Menu/Glyph/Index.vue";
import { MenuPromptIcon } from "#src/models/menu/MenuPromptIcon";
import { MenuPromptGlyphMap } from "#src/services/menu/MenuPromptGlyphMap";
import { GameButton, GameButtonKind, GameScreen } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
  // A state every pill is drawn in, forced by a fixture; a reader's pointer sets it itself
  interactionState?: InteractionState;
}

const { gameText, interactionState } = defineProps<Props>();
const emit = defineEmits<{ close: []; quit: [] }>();
const continueButton = useTemplateRef("continueButton");
// The prompt is a dialog over the world, so focus starts on its first button, the way back to the game
onMounted(() => {
  continueButton.value?.focus();
});
</script>

<template>
  <!-- The quit prompt that Quit Game opens over the world: Continue Game sets the world back, and the two exits leave for
       the app's home, since the browser cannot close the game. Each button is the game's cream pill with its dark disc and
       icon at the left and its label centred in the rest, every place in the reference's own pixels -->
  <GameScreen
    class="exit"
    role="dialog"
    aria-modal="true"
    :aria-label="gameText[GameTextKey.QuitGame]"
    :interaction-state
  >
    <div class="stack">
      <GameButton ref="continueButton" class="prompt" :kind="GameButtonKind.Pill" @click="emit('close')">
        <span class="disc" />
        <MenuGlyph :glyph="MenuPromptGlyphMap[MenuPromptIcon.ContinueGame]" class="continue-glyph" />
        <span class="label">{{ gameText[GameTextKey.ContinueGame] }}</span>
      </GameButton>
      <GameButton class="prompt" :kind="GameButtonKind.Pill" @click="emit('quit')">
        <span class="disc" />
        <MenuGlyph :glyph="MenuPromptGlyphMap[MenuPromptIcon.ExitToLoginInterface]" class="exit-glyph" />
        <span class="label">{{ gameText[GameTextKey.ExitToLoginInterface] }}</span>
      </GameButton>
      <GameButton class="prompt" :kind="GameButtonKind.Pill" @click="emit('quit')">
        <span class="disc" />
        <MenuGlyph :glyph="MenuPromptGlyphMap[MenuPromptIcon.ExitToDesktop]" class="exit-glyph" />
        <span class="label">{{ gameText[GameTextKey.ExitToDesktop] }}</span>
      </GameButton>
    </div>
  </GameScreen>
</template>

<style scoped>
/* Provisional where the game is not yet fitted: the prompt's scale. The reference is a crop of the English PC client's
   prompt with no full frame, so its pixels stand for the game's 1080 high unit until a recording of the whole prompt
   fixes them (the roadmap's Recordings owed) */
.exit {
  --reference-pixel: calc(var(--unit) * 1);
}

.stack {
  position: absolute;
  top: 50%;
  left: 50%;
  width: calc(var(--reference-pixel) * 767);
  height: calc(var(--reference-pixel) * 404);
  transform: translate(-50%, -50%);
}

.prompt {
  position: absolute;
  left: 0;
  width: calc(var(--reference-pixel) * 767);
  height: calc(var(--reference-pixel) * 84);
  padding: 0 0 0 calc(var(--reference-pixel) * 43);
  text-align: center;
}

.prompt:nth-child(2) {
  top: calc(var(--reference-pixel) * 160);
}

.prompt:nth-child(3) {
  top: calc(var(--reference-pixel) * 320);
}

.disc {
  position: absolute;
  top: calc(var(--reference-pixel) * 16);
  left: calc(var(--reference-pixel) * 16);
  width: calc(var(--reference-pixel) * 52);
  height: calc(var(--reference-pixel) * 52);
  border-radius: 50%;
  background: #2f3231;
}

/* Positioned to show over the light a pressed pill adds */
.label {
  position: relative;
  display: block;
  font-size: calc(var(--reference-pixel) * 38);
  font-weight: 600;
  line-height: calc(var(--reference-pixel) * 84);
}

.continue-glyph {
  color: #fecc34;
}

.exit-glyph {
  color: #fd5b5b;
}
</style>
