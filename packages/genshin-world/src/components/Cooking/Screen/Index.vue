<script setup lang="ts">
import type { CookingRecipe } from "#src/models/cooking/CookingRecipe";
import type { GameText } from "genshin-text";

import { readCookingZones } from "#src/services/cooking/readCookingZones";
import { CookingScreen, GameScreen } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
  // The pointer's place along the indicator as a fraction, where the player's Stop leaves it
  pointer: number;
  // The recipe cooked by hand, whose zone parameters lay out the indicator
  recipe: CookingRecipe;
}

const { gameText, pointer, recipe } = defineProps<Props>();
const emit = defineEmits<{ close: []; stop: [] }>();
</script>

<template>
  <GameScreen role="dialog" aria-modal="true" :aria-label="gameText[GameTextKey.CookingTitle]">
    <CookingScreen
      :pointer
      :stop-label="gameText[GameTextKey.CookingStop]"
      :title="gameText[GameTextKey.CookingTitle]"
      :zones="readCookingZones(recipe.qteParam)"
      @close="emit('close')"
      @stop="emit('stop')"
    />
  </GameScreen>
</template>
