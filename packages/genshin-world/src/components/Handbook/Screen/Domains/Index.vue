<script setup lang="ts">
import type { HandbookDomain } from "#src/models/handbook/HandbookDomain";
import type { DomainEntranceLandmark } from "#src/models/world/DomainEntranceLandmark";
import type { GameText } from "genshin-text";

import HandbookScreenDomainsRow from "#src/components/Handbook/Screen/Domains/Row/Index.vue";
import { HandbookTab } from "#src/models/handbook/HandbookTab";
import { HandbookTabGameTextKeyMap } from "#src/services/handbook/HandbookTabGameTextKeyMap";

interface Props {
  // The Domains tab's rows, top to bottom: each domain with the one action the player can take with it
  domains: HandbookDomain[];
  // The game's words in the reader's language
  gameText: GameText;
}

defineProps<Props>();
const emit = defineEmits<{ challenge: [landmark: DomainEntranceLandmark]; claimFirstClear: [entryId: number] }>();
</script>

<template>
  <ol class="domains handbook-list" :aria-label="gameText[HandbookTabGameTextKeyMap[HandbookTab.Domains]]">
    <HandbookScreenDomainsRow
      v-for="domain of domains"
      :key="domain.entryId"
      :domain
      :game-text
      @challenge="(landmark) => emit('challenge', landmark)"
      @claim-first-clear="(entryId) => emit('claimFirstClear', entryId)"
    />
  </ol>
</template>

<style scoped src="../../../../styles/handbookCards.css"></style>

<style scoped>
/* The Domains tab's rows stack under the tab's top, each a card with its title and its one action on the right */
.domains {
  display: flex;
  flex-direction: column;
  gap: calc(var(--reference-pixel) * 20);
}
</style>
