<script setup lang="ts">
import type { Party } from "#src/models/party/Party";
import type { AutoRecoverSetting } from "#src/models/statue/AutoRecoverSetting";
import type { RestorativePower } from "#src/models/statue/RestorativePower";
import type { StatueLevel } from "#src/models/statue/StatueLevel";
import type { StatueRegionProgressSave } from "#src/models/statue/StatueProgressSave";
import type { GameText } from "genshin-text";

import StatueScreen from "#src/components/Statue/Screen/Index.vue";
import StatueWorshipScreen from "#src/components/Statue/Worship/Index.vue";
import { ScreenKind } from "#src/models/screen/ScreenKind";

interface Props {
  gameText: GameText;
  getCharacterName: (characterId: number) => string;
  getMaxHealth: (characterId: number) => number;
  getRegionProgress: (regionId: string) => StatueRegionProgressSave;
  getWorldNow: () => Temporal.Instant;
  getWorshipItemName: (itemId: number) => string;
  party: Party;
  screenKind: ScreenKind;
  statueCount: number;
  worshipLevels: StatueLevel[];
  worshipRegionId?: string;
}

const emit = defineEmits<{ blessing: []; claim: []; close: []; offer: []; worship: [] }>();
const autoRecover = defineModel<AutoRecoverSetting>("autoRecover", { required: true });
const power = defineModel<RestorativePower>("power", { required: true });
const {
  gameText,
  getCharacterName,
  getMaxHealth,
  getRegionProgress,
  getWorldNow,
  getWorshipItemName,
  party,
  screenKind,
  statueCount,
  worshipLevels,
  worshipRegionId,
} = defineProps<Props>();
</script>

<template>
  <StatueScreen
    v-if="screenKind === ScreenKind.Blessing"
    v-model:auto-recover="autoRecover"
    v-model:power="power"
    :game-text
    :get-max-health="getMaxHealth"
    :get-name="getCharacterName"
    :get-now="getWorldNow"
    :party
    :statue-count="statueCount"
    @close="emit('close')"
    @worship="emit('worship')"
  />
  <StatueWorshipScreen
    v-if="screenKind === ScreenKind.Worship && worshipRegionId"
    :game-text
    :get-item-name="getWorshipItemName"
    :levels="worshipLevels"
    :progress="getRegionProgress(worshipRegionId)"
    @blessing="emit('blessing')"
    @claim="emit('claim')"
    @close="emit('close')"
    @offer="emit('offer')"
  />
</template>
