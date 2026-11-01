<script setup lang="ts">
import type { HandbookDayCommission } from "#src/models/handbook/HandbookDayCommission";
import type { GameText } from "genshin-text";

import { toCommissionRowTop } from "#src/services/handbook/toCommissionRowTop";
import { CHECK_MARK_PATH } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  // The commission this row shows
  commission: HandbookDayCommission;
  // The game's words in the reader's language
  gameText: GameText;
  // The row's place in the list, top to bottom, which sets how far down it stands
  index: number;
  // The names the commissions' titles cite, by their name text id, in the reader's language
  nameText: Readonly<Record<string, string>>;
}

const { commission, gameText, index, nameText } = defineProps<Props>();
const emit = defineEmits<{ claimCommission: [commissionId: number] }>();
</script>

<template>
  <li class="commission handbook-card" :style="{ top: toCommissionRowTop(index) }">
    <div class="commission-text">
      <p class="commission-title">{{ nameText[commission.nameTextId] }}</p>
      <p class="commission-progress">{{ commission.progress }}/{{ commission.total }}</p>
    </div>
    <p v-if="commission.regionTextKey" class="commission-region">{{ gameText[commission.regionTextKey] }}</p>
    <button
      v-if="commission.isClaimable"
      class="commission-claim"
      type="button"
      @click="emit('claimCommission', commission.commissionId)"
    >
      {{ gameText[GameTextKey.ClaimRewards] }}
    </button>
    <svg v-else-if="commission.isClaimed" class="commission-check" viewBox="0 0 252 228" aria-hidden="true">
      <path fill-rule="evenodd" :d="CHECK_MARK_PATH" />
    </svg>
  </li>
</template>

<style scoped src="../../../../../styles/handbookCards.css"></style>

<style scoped>
/* The preferred region sits where a row's rewards stand, centred on the title's line */
.commission-region {
  position: absolute;
  top: calc(var(--reference-pixel) * 121);
  left: calc(var(--reference-pixel) * 1018);
  margin: 0;
  color: #82644a;
  font-size: calc(var(--reference-pixel) * 48);
  font-weight: 600;
  translate: 0 -50%;
}

/* A claimable commission's button stands where the region's line does not, on the row's right */
.commission-claim {
  position: absolute;
  top: calc(var(--reference-pixel) * 83);
  left: calc(var(--reference-pixel) * 1250);
}
</style>
