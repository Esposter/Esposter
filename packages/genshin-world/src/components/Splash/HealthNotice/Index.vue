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
/* Measured against the English PC client's notice: the divider spans the screen's width less a fixed inset a side, and
   the text sits a little inside it, by the inset that keeps the first line's last word on that line. The sizes are the
   ones that match the English notice's line breaks in Signika, whose letters are proportioned apart from the game's own
   face. The heading's and the text's greys are the English recording's */
.health-notice {
  display: grid;
  place-items: center;
  background: var(--white);
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
  color: #353535;
  font-size: calc(var(--unit) * 57.1);
  font-weight: 600;
  line-height: calc(var(--unit) * 60);
}

.divider {
  align-self: stretch;
  margin-top: calc(var(--unit) * 14.5);
}

.paragraph {
  max-width: calc(100cqw - var(--unit) * 410);
  margin: calc(var(--unit) * 12.5) 0 0;
  color: #696969;
  font-size: calc(var(--unit) * 40.5);
  font-weight: 600;
  line-height: calc(var(--unit) * 48);
}

/* A blank line between paragraphs, as the notice sets them */
.paragraph + .paragraph {
  margin-top: calc(var(--unit) * 48);
}
</style>
