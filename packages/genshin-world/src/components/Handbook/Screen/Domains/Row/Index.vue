<script setup lang="ts">
import type { HandbookDomain } from "#src/models/handbook/HandbookDomain";
import type { DomainEntranceLandmark } from "#src/models/world/DomainEntranceLandmark";
import type { GameText } from "genshin-text";

import { GameTextKey } from "genshin-text";

interface Props {
  // The domain this row shows, with the one action the player can take with it
  domain: HandbookDomain;
  // The game's words in the reader's language
  gameText: GameText;
}

const { domain, gameText } = defineProps<Props>();
const emit = defineEmits<{ challenge: [landmark: DomainEntranceLandmark]; claimFirstClear: [entryId: number] }>();
</script>

<template>
  <li class="domain handbook-card">
    <p class="domain-title">{{ gameText[domain.titleTextKey] }}</p>
    <button
      v-if="domain.isQuickChallengeable"
      class="domain-action"
      type="button"
      @click="emit('challenge', domain.landmark)"
    >
      {{ gameText[GameTextKey.BossQuickChallenge] }}
    </button>
    <button
      v-if="domain.isFirstClearClaimable"
      class="domain-action"
      type="button"
      @click="emit('claimFirstClear', domain.entryId)"
    >
      {{ gameText[GameTextKey.ClaimRewards] }}
    </button>
  </li>
</template>

<style scoped src="../../../../../styles/handbookCards.css"></style>

<style scoped>
.domain {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: calc(var(--reference-pixel) * 24);
  padding: calc(var(--reference-pixel) * 24) calc(var(--reference-pixel) * 40);
}

.domain-title {
  margin: 0;
  color: #555453;
  font-size: calc(var(--reference-pixel) * 52);
  font-weight: 600;
}
</style>
