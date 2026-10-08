<script setup lang="ts">
import type { TitledScreenKind } from "#src/models/screen/TitledScreenKind";
import type { GameText } from "genshin-text";

import { PAIMON_MENU_CONTENTS, PAIMON_MENU_SIDE_BAR } from "#src/services/menu/constants";
import { ScreenKindGameTextKeyMap } from "#src/services/screen/ScreenKindGameTextKeyMap";
import { GameScreen } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  // Whether a screen is built, which its entry opens; an unbuilt one's entry is drawn disabled
  checkIsBuilt: (screenKind: TitledScreenKind) => boolean;
  // The game's words in the reader's language
  gameText: GameText;
}

const { checkIsBuilt, gameText } = defineProps<Props>();
const emit = defineEmits<{ close: []; open: [screenKind: TitledScreenKind]; quit: [] }>();
const backButton = useTemplateRef("backButton");
// The menu is a dialog over the world, so focus starts inside it, on its way back
onMounted(() => {
  backButton.value?.focus();
});
</script>

<template>
  <!-- The game's pause menu: its side bar of Back, the side bar's screens and Quit Game down the left, and its contents
       Beside it, the world drawn on to the right where Paimon floats. Every entry the game has is here, in its order,
       One whose screen is not built yet drawn disabled -->
  <GameScreen class="paimon-menu" role="dialog" aria-modal="true" :aria-label="gameText[GameTextKey.Paimon]">
    <nav class="menu">
      <div class="side-bar" role="group">
        <button ref="backButton" class="side-entry" type="button" @click="emit('close')">
          {{ gameText[GameTextKey.Back] }}
        </button>
        <button
          v-for="screenKind of PAIMON_MENU_SIDE_BAR"
          :key="screenKind"
          class="side-entry"
          :disabled="!checkIsBuilt(screenKind)"
          type="button"
          @click="emit('open', screenKind)"
        >
          {{ gameText[ScreenKindGameTextKeyMap[screenKind]] }}
        </button>
        <button class="side-entry" type="button" @click="emit('quit')">{{ gameText[GameTextKey.QuitGame] }}</button>
      </div>
      <div class="contents" role="group">
        <button
          v-for="screenKind of PAIMON_MENU_CONTENTS"
          :key="screenKind"
          class="entry"
          :disabled="!checkIsBuilt(screenKind)"
          type="button"
          @click="emit('open', screenKind)"
        >
          {{ gameText[ScreenKindGameTextKeyMap[screenKind]] }}
        </button>
      </div>
    </nav>
  </GameScreen>
</template>

<style scoped>
/* Provisional: the panel's reach, the side bar's and the contents' sizes, their four columns and every colour wait on
   A recording of the English PC client's Paimon menu at 1080 high and the fit of its RectTransform tree, as the login's
   Were measured; the entries' icons wait on their traces */
.paimon-menu {
  background: linear-gradient(90deg, rgb(20 24 36 / 0.92), rgb(20 24 36 / 0.85) 55%, rgb(20 24 36 / 0.2));
  color: #ece5d8;
}

.menu {
  display: flex;
  gap: calc(var(--unit) * 48);
  height: 100%;
  padding: calc(var(--unit) * 64) calc(var(--unit) * 72);
  box-sizing: border-box;
}

.side-bar {
  display: flex;
  flex-direction: column;
  gap: calc(var(--unit) * 12);
  width: calc(var(--unit) * 200);
}

.contents {
  display: grid;
  grid-template-columns: repeat(4, calc(var(--unit) * 200));
  grid-auto-rows: calc(var(--unit) * 150);
  align-content: start;
  gap: calc(var(--unit) * 20);
}

.side-entry,
.entry {
  border: none;
  border-radius: calc(var(--unit) * 12);
  background: rgb(255 255 255 / 0.06);
  color: inherit;
  cursor: inherit;
  font: inherit;
  font-size: calc(var(--unit) * 24);
}

.side-entry {
  padding: calc(var(--unit) * 14) calc(var(--unit) * 18);
  text-align: start;
}

.side-entry:hover:enabled,
.entry:hover:enabled,
.side-entry:focus-visible,
.entry:focus-visible {
  outline: none;
  background: #ece5d8;
  color: #3b4255;
}

.side-entry:disabled,
.entry:disabled {
  opacity: 0.4;
}
</style>
