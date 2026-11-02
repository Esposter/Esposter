<script setup lang="ts">
import type { GameText } from "genshin-text";

import { GameTextKey } from "genshin-text";

interface Props {
  // Whether a Long-Term Encounter Point can be converted now, so its button is enabled
  isLongTermEncounterPointUsable: boolean;
  // The most daily Encounter Points the storage holds, in whole points, which the panel's count reads against
  encounterPointLimit: number;
  // The daily Encounter Points held, as whole points, which the panel's count shows
  encounterPoints: number;
  // The game's words in the reader's language
  gameText: GameText;
  // The Long-Term Encounter Points held, as whole points, which the Commissions tab's stage rewards count
  longTermEncounterPoints: number;
}

const { isLongTermEncounterPointUsable, encounterPointLimit, encounterPoints, gameText, longTermEncounterPoints } =
  defineProps<Props>();
const emit = defineEmits<{ useLongTermEncounterPoints: [] }>();
</script>

<template>
  <li class="encounter-points">
    <p class="encounter-points-title">{{ gameText[GameTextKey.AdventureEncounterRewards] }}</p>
    <!-- The daily points held over the storage's limit. The dump has no label for this count, so it stands bare until a recording measures the panel -->
    <p class="encounter-points-daily">{{ encounterPoints }}/{{ encounterPointLimit }}</p>
    <p class="encounter-points-stored">
      {{ gameText[GameTextKey.LongTermEncounterPointsStored] }}
      <span>{{ longTermEncounterPoints }}</span>
    </p>
    <button
      class="encounter-points-use"
      :disabled="!isLongTermEncounterPointUsable"
      type="button"
      @click="emit('useLongTermEncounterPoints')"
    >
      {{ gameText[GameTextKey.UseLongTermEncounterPoints] }}
    </button>
  </li>
</template>

<style scoped src="../../../../../styles/handbookCards.css"></style>

<style scoped>
/* The stage rewards sit under the four commissions, in the tab's own box */
.encounter-points {
  position: absolute;
  top: calc(var(--reference-pixel) * 1040);
  left: 0;
  display: flex;
  align-items: center;
  gap: calc(var(--reference-pixel) * 40);
  width: calc(var(--reference-pixel) * 1670);
  height: calc(var(--reference-pixel) * 150);
  color: #555453;
  font-size: calc(var(--reference-pixel) * 48);
}

.encounter-points-title,
.encounter-points-daily,
.encounter-points-stored {
  margin: 0;
  font-weight: 600;
}

.encounter-points-use {
  margin-left: auto;
}

.encounter-points-use:disabled {
  background: #a8a093;
  cursor: default;
}
</style>
