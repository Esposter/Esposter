<script setup lang="ts">
import type { Character } from "#src/models/character/Character";
import type { CharacterData } from "#src/models/character/CharacterData";
import type { Party } from "#src/models/party/Party";
import type { PartySetupSlot } from "genshin-interface";
import type { GameText } from "genshin-text";

import { ElementMarkPathMap } from "#src/services/loading/ElementMarkPathMap";
import { DEFAULT_PARTY_TEAM_NAME_GAME_TEXT_KEYS } from "#src/services/party/constants";
import { deployPartyTeam } from "#src/services/party/deployPartyTeam";
import { getPartyTeamSlots } from "#src/services/party/getPartyTeamSlots";
import { quickSetupPartyTeam } from "#src/services/party/quickSetupPartyTeam";
import { PartySetupScreen } from "genshin-interface";
import { fillGameTextValues, GameTextKey } from "genshin-text";

interface Props {
  // The character data by id, whose element and name text id each slot shows
  characterDataMap: ReadonlyMap<number, CharacterData>;
  // The characters the player holds, in the order they are listed, which Quick Setup picks from
  characters: Character[];
  gameText: GameText;
  // The names of the characters in the reader's language, by their game text ids
  nameText: Readonly<Record<string, string>>;
  // The party Party Setup edits; Deploy and Quick Setup change it in place
  party: Party;
  // The name the player chose for the Traveler, shown on the Traveler's slot while one is chosen
  travelerName: string;
}

const { characterDataMap, characters, gameText, nameText, party, travelerName } = defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
// Party Setup opens on the deployed team, and the arrows step from there
const teamIndex = ref(party.deployedTeamIndex);
const team = computed(() => party.teams[teamIndex.value]);
const teamName = computed(() => {
  if (team.value?.name) return team.value.name;
  const defaultNameKey = DEFAULT_PARTY_TEAM_NAME_GAME_TEXT_KEYS[teamIndex.value];
  return defaultNameKey ? gameText[defaultNameKey] : "";
});
const slots = computed<PartySetupSlot[]>(() => {
  if (!team.value) return [];
  return getPartyTeamSlots(team.value, characters, characterDataMap, nameText, travelerName).map((slot) => ({
    elementMarkPath: slot.element === undefined ? undefined : ElementMarkPathMap[slot.element],
    levelText: slot.level ? fillGameTextValues(gameText[GameTextKey.LevelFormat], slot.level) : "",
    name: slot.name,
  }));
});

// Steps to the next team, the arrows going round the teams from the last back to the first
const stepTeam = (step: number) => {
  const count = party.teams.length;
  teamIndex.value = (teamIndex.value + step + count) % count;
};
</script>

<template>
  <PartySetupScreen
    :back-label="gameText[GameTextKey.Back]"
    :configure-team-label="gameText[GameTextKey.ConfigureTeam]"
    :deploy-label="gameText[GameTextKey.Deploy]"
    :quick-setup-label="gameText[GameTextKey.QuickSetup]"
    :slots
    :team-name
    :title="gameText[GameTextKey.PartySetup]"
    @close="emit('close')"
    @deploy="deployPartyTeam(party, teamIndex)"
    @next="stepTeam(1)"
    @previous="stepTeam(-1)"
    @quick-setup="
      quickSetupPartyTeam(
        party,
        teamIndex,
        characters.map(({ id }) => id),
      )
    "
  />
</template>
