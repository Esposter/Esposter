<script setup lang="ts">
import type { GameText } from "genshin-text";

import { GameScreen, OrnamentDivider } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
}

const { gameText } = defineProps<Props>();
// The notice is one string in the game's text, its paragraphs a blank line apart
const paragraphs = computed(() => gameText[GameTextKey.HealthNotice].split("\n\n"));
</script>

<template>
  <GameScreen class="health-notice">
    <div class="block" role="alert">
      <!-- A heading to a screen reader, drawn as a paragraph so no host's own heading styles reach it -->
      <p class="title" role="heading" aria-level="2">{{ gameText[GameTextKey.HealthNoticeTitle] }}</p>
      <OrnamentDivider class="divider" />
      <p v-for="paragraph of paragraphs" :key="paragraph" class="paragraph">{{ paragraph }}</p>
    </div>
  </GameScreen>
</template>

<style scoped>
/* Measured from the English client's notice and held against the Japanese one's at 60 frames: the divider spans the screen's
   Width less 190 units a side and the text 20 units inside it, so a wider screen sets the notice in fewer lines. The
   Sizes are the ones that score best against the English client's notice in Signika (heading 58 units, text 40.5), since
   Its letters are proportioned apart from the game's own face. The text's grey is the Japanese recording's, which the English
   Picture's text agrees with; the English heading is near black, darker than the Japanese one's */
.health-notice {
  display: grid;
  place-items: center;
  background: #fff;
}

.block {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: calc(100cqw - var(--unit) * 380);
  text-align: center;
}

.title {
  margin: 0;
  color: #1d1d1d;
  font-size: calc(var(--unit) * 58);
  font-weight: 600;
  line-height: calc(var(--unit) * 60);
}

.divider {
  align-self: stretch;
  margin-top: calc(var(--unit) * 14.5);
}

.paragraph {
  max-width: calc(100cqw - var(--unit) * 420);
  margin: calc(var(--unit) * 12.5) 0 0;
  color: #656565;
  font-size: calc(var(--unit) * 40.5);
  font-weight: 600;
  line-height: calc(var(--unit) * 48.36);
}

/* A blank line between paragraphs, as the notice sets them */
.paragraph + .paragraph {
  margin-top: calc(var(--unit) * 48.36);
}
</style>
