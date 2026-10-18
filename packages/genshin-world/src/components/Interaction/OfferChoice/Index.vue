<script setup lang="ts">
import type { BlossomClaimOffer } from "#src/models/originalResin/BlossomClaimOffer";

interface Props {
  // The text of the row that leaves the choice unmade
  cancelLabel: string;
  // Whether a row restores Original Resin with a Fragile Resin, where the held Original Resin covers no claim
  canRestore?: boolean;
  // The text of a row paid in Condensed Resin
  condensedLabel: string;
  // The claims the held resin affords, one row each
  offers: BlossomClaimOffer[];
  // The text of a row paid in Original Resin
  originalLabel: string;
  // The text of the restore row
  restoreLabel?: string;
}

const { cancelLabel, canRestore, condensedLabel, offers, originalLabel, restoreLabel } = defineProps<Props>();
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
    <button
      v-for="offer of offers"
      :key="`${offer.claimCount}-${offer.condensedResinCount}-${offer.resin}`"
      class="offer"
      type="button"
      @click="emit('choose', offer)"
    >
      {{ offer.condensedResinCount > 0 ? condensedLabel : originalLabel }}
    </button>
    <button v-if="canRestore" class="offer" type="button" @click="emit('restore')">{{ restoreLabel }}</button>
    <button class="offer" type="button" @click="emit('close')">{{ cancelLabel }}</button>
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
