<script setup lang="ts">
import type { TextChunk } from "#src/models/data/TextChunk";
import type { AbyssBenedictionChoice } from "#src/models/spiralAbyss/AbyssBenedictionChoice";
import type { GameText } from "genshin-text";

import { GameButton, GameButtonKind, GameScreen } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  // The Benedictions the chamber's list offers, each with its description's text hash and its id in the buff table
  choices: AbyssBenedictionChoice[];
  // The game's words in the reader's language
  gameText: GameText;
  // The names in the reader's language, each by its text id
  nameText: TextChunk;
}

const { choices, gameText, nameText } = defineProps<Props>();
const emit = defineEmits<{ choose: [towerBuffId: number] }>();
</script>

<template>
  <!-- The Benediction the player takes into a chamber, offered at its start: the game's own hint over one button per
       Benediction in the list, its description in the reader's language, and a press chooses it -->
  <GameScreen
    class="abyss-benediction"
    role="dialog"
    aria-modal="true"
    :aria-label="gameText[GameTextKey.AbyssBenedictionHint]"
  >
    <p class="hint">{{ gameText[GameTextKey.AbyssBenedictionHint] }}</p>
    <GameButton
      v-for="{ descriptionTextHash, towerBuffId } in choices"
      :key="towerBuffId"
      :kind="GameButtonKind.Pill"
      @click="emit('choose', towerBuffId)"
    >
      {{ nameText[String(descriptionTextHash)] }}
    </GameButton>
  </GameScreen>
</template>
