<script setup lang="ts">
import type { GameLanguage, GameText } from "genshin-text";

import { GameClient } from "#src/models/splash/GameClient";
import { GameLanguageGameClientMap } from "#src/services/splash/GameLanguageGameClientMap";
import { GameLanguageTitleLogoMap } from "#src/services/splash/GameLanguageTitleLogoMap";
import { TitleLogoPathMap } from "#src/services/splash/TitleLogoPathMap";
import { GameScreen } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
  // The reader's language, whose client's title logo the splash shows, with mainland China's licence under it
  language: GameLanguage;
}

const { gameText, language } = defineProps<Props>();
const licenceLines = computed(() => gameText[GameTextKey.TitleLicence].split("\n"));
</script>

<template>
  <GameScreen class="title-splash" role="img" :aria-label="gameText[GameTextKey.GameTitle]">
    <svg class="logo" viewBox="0 0 4096 2752" aria-hidden="true">
      <path :d="TitleLogoPathMap[GameLanguageTitleLogoMap[language]]" />
    </svg>
    <p v-if="GameLanguageGameClientMap[language] === GameClient.Mainland" class="licence">
      <span v-for="line of licenceLines" :key="line" class="line">{{ line }}</span>
    </p>
  </GameScreen>
</template>

<style scoped>
.title-splash {
  background: var(--white);
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

/* The mainland client's licence, measured off its recording (`bili-av532052219`, 1080 high): four centred lines 40
   Units apart, their glyphs about 24 units tall and their last line's foot 49 units over the screen's, a lighter grey
   Than the logo's. It fades in over 400 ms, 400 ms behind the logo, and out with it */
.licence {
  position: absolute;
  right: 0;
  bottom: calc(var(--unit) * 38);
  left: 0;
  margin: 0;
  color: #555;
  font-size: calc(var(--unit) * 26.6);
  font-weight: 600;
  line-height: calc(var(--unit) * 40);
  text-align: center;
  animation: licence-in 400ms ease-in 400ms both;
}

.line {
  display: block;
  white-space: pre;
}

@keyframes licence-in {
  from {
    opacity: 0;
  }
}
</style>
