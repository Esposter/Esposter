<script setup lang="ts">
import type { Party } from "#src/models/party/Party";
import type { RestorativePower } from "#src/models/statue/RestorativePower";
import type { GameText } from "genshin-text";

import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { RESTORATIVE_POWER_PER_STATUE } from "#src/services/statue/constants";
import { healPartyMemberWithPower } from "#src/services/statue/healPartyMemberWithPower";
import { regenerateRestorativePower } from "#src/services/statue/regenerateRestorativePower";
import { BlessingScreen, GameScreen } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
  // The Max HP of a character on the field, by its id
  getMaxHealth: (characterId: number) => number;
  // The name of a character in the reader's language, by its id
  getName: (characterId: number) => string;
  // The world's clock now, which the pool refills to
  getNow: () => Temporal.Instant;
  // The party, whose deployed members a click on the Blessing heals
  party: Party;
  // The Statues of The Seven unlocked, each adding its share to the pool's maximum
  statueCount: number;
}

const { gameText, getMaxHealth, getName, getNow, party, statueCount } = defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
// The Restorative Power as the save's moment left it, refilled to now before the screen shows it or spends it
const power = defineModel<RestorativePower>("power", { required: true });

const regeneratePower = () => regenerateRestorativePower(power.value, statueCount, getNow());
// The deployed team's members, each with the share of its Max HP it holds
const getMembers = () =>
  getDeployedCharacterIds(party).map((id) => ({
    healthShare: getPartyMember(party, id).healthShare,
    id,
    name: getName(id),
  }));
const heal = (characterId: number) => {
  power.value = healPartyMemberWithPower(party, characterId, getMaxHealth(characterId), regeneratePower());
};
</script>

<template>
  <GameScreen role="dialog" aria-modal="true" :aria-label="gameText[GameTextKey.StatueBlessing]">
    <BlessingScreen
      :members="getMembers()"
      :pool-amount="regeneratePower().amount"
      :pool-maximum="statueCount * RESTORATIVE_POWER_PER_STATUE"
      :title="gameText[GameTextKey.StatueBlessing]"
      @close="emit('close')"
      @heal="(characterId) => heal(characterId)"
    />
  </GameScreen>
</template>
