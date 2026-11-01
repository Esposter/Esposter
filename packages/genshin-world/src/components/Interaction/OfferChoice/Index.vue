<script setup lang="ts">
import type { BlossomClaimOffer } from "#src/models/originalResin/BlossomClaimOffer";
import type { GameText } from "genshin-text";

import { GameButton, GameButtonKind } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  // Whether a row restores Original Resin with a Fragile Resin, where the held Original Resin covers no claim
  canRestore?: boolean;
  // The text of the rows: the one that leaves the choice unmade, the two resins a row is paid in and the restore row
  gameText: GameText;
  // The claims the held resin affords, one row each
  offers: BlossomClaimOffer[];
}

const { canRestore = false, gameText, offers } = defineProps<Props>();
const emit = defineEmits<{
  // A row chosen, which spends its resin and grants its rewards
  choose: [offer: BlossomClaimOffer];
  // The choice left unmade, which grants nothing
  close: [];
  // The restore row chosen, which spends a Fragile Resin for the Original Resin it restores
  restore: [];
}>();
</script>

<template>
  <!-- The claims F offers at a revealed blossom, one row for each way the held resin pays a claim, a restore row where a
       Fragile Resin can restore the Original Resin, and a row that leaves the blossom unclaimed. Drawn in the prompts
       beside the character, where the prompt list is -->
  <div class="offer-choice">
    <GameButton
      v-for="offer of offers"
      :key="`${offer.claimCount}-${offer.condensedResinCount}-${offer.resin}`"
      class="offer"
      :kind="GameButtonKind.Row"
      tip=""
      @click="emit('choose', offer)"
    >
      {{ gameText[offer.condensedResinCount > 0 ? GameTextKey.UseCondensedResin : GameTextKey.UseOriginalResin] }}
    </GameButton>
    <GameButton v-if="canRestore" class="offer" :kind="GameButtonKind.Row" tip="" @click="emit('restore')">
      {{ gameText[GameTextKey.FragileResinRestore] }}
    </GameButton>
    <GameButton class="offer" :kind="GameButtonKind.Row" tip="" @click="emit('close')">{{
      gameText[GameTextKey.Cancel]
    }}</GameButton>
  </div>
</template>

<style scoped>
/* Provisional: the rows stack in the prompts' column, until the choice is drawn to the game's own layout */
.offer-choice {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
  pointer-events: auto;
}

.offer {
  padding: 4px 12px;
}
</style>
