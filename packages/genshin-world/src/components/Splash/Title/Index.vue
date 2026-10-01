<script setup lang="ts">
import type { GameText } from "genshin-text";

import { TITLE_LOGO_PATH } from "#src/services/splash/TitleLogoPath";
import { GameScreen } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
}

const { gameText } = defineProps<Props>();
</script>

<template>
  <GameScreen class="title-splash" role="img" :aria-label="gameText[GameTextKey.GameTitle]">
    <svg class="logo" viewBox="0 0 3840 1453" aria-hidden="true"><path :d="TITLE_LOGO_PATH" /></svg>
  </GameScreen>
</template>

<style scoped>
.title-splash {
  background: #fff;
}

/* Its box placed so its ink sits where the English client's does: 590 units wide, 420 down, a hair left of centre,
   In the flat grey the game draws its title in on the splash */
.logo {
  position: absolute;
  top: calc(50% - var(--unit) * 129.55);
  left: calc(50% - var(--unit) * 306.9);
  width: calc(var(--unit) * 611.4);
  aspect-ratio: 3840 / 1453;
  fill: #333;
}
</style>
