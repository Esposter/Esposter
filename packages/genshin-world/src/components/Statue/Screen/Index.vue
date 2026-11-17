<script setup lang="ts">
import type { Party } from "#src/models/party/Party";
import type { AutoRecoverSetting } from "#src/models/statue/AutoRecoverSetting";
import type { RestorativePower } from "#src/models/statue/RestorativePower";
import type { GameText } from "genshin-text";

import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { RESTORATIVE_POWER_PER_STATUE } from "#src/services/statue/constants";
import { healPartyMemberWithPower } from "#src/services/statue/healPartyMemberWithPower";
import { regenerateRestorativePower } from "#src/services/statue/regenerateRestorativePower";
import { stepAutoRecoverThreshold } from "#src/services/statue/stepAutoRecoverThreshold";
import { BlessingScreen, GameScreen } from "genshin-interface";
import { fillGameTextValues, GameTextKey } from "genshin-text";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
  // The level of a character by its id, which its member's tab shows; none while the host does not know it
  getLevel?: ((characterId: number) => number | undefined) | undefined;
  // The Max HP of a character on the field, by its id
  getMaxHealth: (characterId: number) => number;
  // The name of a character in the reader's language, by its id
  getName: (characterId: number) => string;
  // The world's clock now, which a heal spends the pool at
  getNow: () => Temporal.Instant;
  // The world's clock as its ticks set it, which the pool is shown refilled to, so the figure moves as time passes
  now: Temporal.Instant;
  // The party, whose deployed members a click on the Blessing heals
  party: Party;
  // The Statues of The Seven unlocked, each adding its share to the pool's maximum
  statueCount: number;
}

// The Restorative Power as the save's moment left it, refilled to now before the screen shows it or spends it
const power = defineModel<RestorativePower>("power", { required: true });
// Auto-recover's switch and threshold, which the screen sets and the Session's stand by a statue reads
const autoRecover = defineModel<AutoRecoverSetting>("autoRecover", { required: true });
const { gameText, getLevel, getMaxHealth, getName, getNow, now, party, statueCount } = defineProps<Props>();
const emit = defineEmits<{ close: []; worship: [] }>();
// The pool as the world's clock last ticked it, so the figure refills on the screen as time passes
const pool = computed(() => regenerateRestorativePower(power.value, statueCount, now));
const toggleAutoRecover = () => {
  autoRecover.value = { ...autoRecover.value, isOn: !autoRecover.value.isOn };
};
const stepThreshold = (direction: -1 | 1) => {
  autoRecover.value = {
    ...autoRecover.value,
    thresholdPercent: stepAutoRecoverThreshold(autoRecover.value.thresholdPercent, direction),
  };
};
// A member as the Blessing lists it: its share of Max HP, its name and, while the host knows it, its level's words
const toMember = (id: number) => {
  const level = getLevel?.(id);
  return {
    healthShare: getPartyMember(party, id).healthShare,
    id,
    levelText: level === undefined ? undefined : fillGameTextValues(gameText[GameTextKey.LevelFormat], level),
    name: getName(id),
  };
};
// The deployed team's members, which the game lists as in combat
const members = computed(() => getDeployedCharacterIds(party).map((id) => toMember(id)));
// The members of the other teams, each once and none of them deployed, which the game lists as preparing for combat
const waitingMembers = computed(() => {
  const deployedIds = getDeployedCharacterIds(party);
  return [...new Set(party.teams.flatMap(({ characterIds }) => characterIds))]
    .filter((id) => !deployedIds.includes(id))
    .map((id) => toMember(id));
});
// A heal spends the pool at the exact clock, not the last tick the screen shows it at
const heal = (characterId: number) => {
  power.value = healPartyMemberWithPower(
    party,
    characterId,
    getMaxHealth(characterId),
    regenerateRestorativePower(power.value, statueCount, getNow()),
  );
};
</script>

<template>
  <GameScreen role="dialog" aria-modal="true" :aria-label="gameText[GameTextKey.StatueBlessing]">
    <BlessingScreen
      :auto-recover-label="gameText[GameTextKey.AutoRecoverWhenNearby]"
      :close-label="gameText[GameTextKey.Back]"
      :heal-hint="gameText[GameTextKey.ClickPortraitToRestoreHp]"
      :in-combat-label="gameText[GameTextKey.InCombat]"
      :is-auto-recover-on="autoRecover.isOn"
      :members
      :pool-amount="pool.amount"
      :pool-label="gameText[GameTextKey.RestorativePower]"
      :pool-maximum="statueCount * RESTORATIVE_POWER_PER_STATUE"
      :preparing-label="gameText[GameTextKey.PreparingForCombat]"
      :threshold-percent="autoRecover.thresholdPercent"
      :title="gameText[GameTextKey.StatueBlessing]"
      :waiting-members
      :worship-title="gameText[GameTextKey.StatueWorship]"
      @close="emit('close')"
      @heal="(characterId) => heal(characterId)"
      @step-threshold="(direction) => stepThreshold(direction)"
      @toggle-auto-recover="toggleAutoRecover()"
      @worship="emit('worship')"
    />
  </GameScreen>
</template>
