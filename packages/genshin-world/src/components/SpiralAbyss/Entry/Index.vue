<script setup lang="ts">
import type { TextChunk } from "#src/models/data/TextChunk";
import type { AbyssPeriodBlessing } from "#src/models/spiralAbyss/AbyssPeriodBlessing";
import type { GameText } from "genshin-text";

import ScreenHeader from "#src/components/Menu/ScreenHeader/Index.vue";
import { GameScreen } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  // The blessing of the Moon Spire's period the entry shows, and none in the Corridor, which runs no period
  blessing?: AbyssPeriodBlessing;
  // The game's words in the reader's language
  gameText: GameText;
  // The names in the reader's language, each by its text id
  nameText: TextChunk;
}

const { blessing, gameText, nameText } = defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
</script>

<template>
  <!-- The Spiral Abyss's entry: the title of the part the player enters over the cross that closes it, and for the Moon Spire
       the period's blessing, its name and its description, in the reader's language -->
  <GameScreen
    class="abyss-entry"
    role="dialog"
    aria-modal="true"
    :aria-label="blessing ? gameText[GameTextKey.AbyssMoonSpire] : gameText[GameTextKey.AbyssCorridor]"
  >
    <ScreenHeader
      :game-text
      :title="blessing ? gameText[GameTextKey.AbyssMoonSpire] : gameText[GameTextKey.AbyssCorridor]"
      @close="emit('close')"
    />
    <div v-if="blessing" class="blessing">
      <h2 class="blessing-name">{{ nameText[String(blessing.nameTextHash)] }}</h2>
      <p class="blessing-description">{{ nameText[String(blessing.descriptionTextHash)] }}</p>
    </div>
  </GameScreen>
</template>
