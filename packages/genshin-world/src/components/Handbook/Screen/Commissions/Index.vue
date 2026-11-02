<script setup lang="ts">
import type { HandbookDayCommission } from "#src/models/handbook/HandbookDayCommission";
import type { GameText } from "genshin-text";

import HandbookScreenCommissionsEncounterPoints from "#src/components/Handbook/Screen/Commissions/EncounterPoints/Index.vue";
import HandbookScreenCommissionsRow from "#src/components/Handbook/Screen/Commissions/Row/Index.vue";
import { HandbookTab } from "#src/models/handbook/HandbookTab";
import { HandbookTabGameTextKeyMap } from "#src/services/handbook/HandbookTabGameTextKeyMap";

interface Props {
  // Whether a Long-Term Encounter Point can be converted now, so its button is enabled
  isLongTermEncounterPointUsable: boolean;
  // The day's four commissions, top to bottom, as the Commissions tab lists them
  dayCommissions: HandbookDayCommission[];
  // The most daily Encounter Points the storage holds, in whole points, which the panel's count reads against
  encounterPointLimit: number;
  // The daily Encounter Points held, as whole points, which the panel's count shows
  encounterPoints: number;
  // The game's words in the reader's language
  gameText: GameText;
  // Whether the Adventure Encounters panel is open at the player's Adventure Rank, so its stage rewards show
  isAdventureEncountersUnlocked: boolean;
  // The Long-Term Encounter Points held, as whole points, which the Commissions tab's stage rewards count
  longTermEncounterPoints: number;
  // The names the commissions' titles cite, by their name text id, in the reader's language
  nameText: Readonly<Record<string, string>>;
}

const {
  isLongTermEncounterPointUsable,
  dayCommissions,
  encounterPointLimit,
  encounterPoints,
  gameText,
  isAdventureEncountersUnlocked,
  longTermEncounterPoints,
  nameText,
} = defineProps<Props>();
const emit = defineEmits<{ claimCommission: [commissionId: number]; useLongTermEncounterPoints: [] }>();
</script>

<template>
  <ol class="commissions handbook-list" :aria-label="gameText[HandbookTabGameTextKeyMap[HandbookTab.Commissions]]">
    <HandbookScreenCommissionsRow
      v-for="(commission, index) of dayCommissions"
      :key="index"
      :commission
      :game-text="gameText"
      :index
      :name-text="nameText"
      @claim-commission="(commissionId) => emit('claimCommission', commissionId)"
    />
    <!-- The Encounter Points stage rewards at the foot of the tab, where the game keeps the Long-Term Encounter Points -->
    <HandbookScreenCommissionsEncounterPoints
      v-if="isAdventureEncountersUnlocked"
      :is-long-term-encounter-point-usable="isLongTermEncounterPointUsable"
      :encounter-point-limit="encounterPointLimit"
      :encounter-points="encounterPoints"
      :game-text="gameText"
      :long-term-encounter-points="longTermEncounterPoints"
      @use-long-term-encounter-points="emit('useLongTermEncounterPoints')"
    />
  </ol>
</template>

<style scoped src="../../../../styles/handbookCards.css"></style>
