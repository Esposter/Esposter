<script setup lang="ts">
import type { GameLanguage, GameText } from "genshin-text";

import { GameLanguageTitleLogoMap } from "#src/services/splash/GameLanguageTitleLogoMap";
import { TitleLogoPathMap } from "#src/services/splash/TitleLogoPathMap";
import { GameScreen } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
  // The reader's language, whose client's title logo the splash shows
  language: GameLanguage;
}

const { gameText, language } = defineProps<Props>();
</script>

<template>
  <GameScreen class="title-splash" role="img" :aria-label="gameText[GameTextKey.GameTitle]">
    <svg class="logo" viewBox="0 0 4096 2752" aria-hidden="true">
      <path :d="TitleLogoPathMap[GameLanguageTitleLogoMap[language]]" />
    </svg>
  </GameScreen>
</template>

<style scoped>
.title-splash {
  background: #fff;
}

/* The logos' shared canvas, placed so the English logo's ink sits where the English client's does: 590 units wide, 420
   Down, a hair left of centre. Every logo is drawn on the one canvas the game's sprites share, so the others stand where
   Their clients' do. In the flat grey the game draws its title in on the splash */
.logo {
  position: absolute;
  top: calc(50% - var(--unit) * 206.08);
  left: calc(50% - var(--unit) * 307.75);
  width: calc(var(--unit) * 612.68);
  aspect-ratio: 4096 / 2752;
  fill: #333;
  fill-rule: evenodd;
}
</style>
