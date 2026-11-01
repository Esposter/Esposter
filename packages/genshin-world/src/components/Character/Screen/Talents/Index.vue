<script setup lang="ts">
import type { Character } from "#src/models/character/Character";
import type { CharacterTalentKit } from "#src/models/character/CharacterTalentKit";
import type { TalentUpgradeMap } from "#src/models/character/TalentUpgradeMap";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { GameText } from "genshin-text";

import { TalentUpgradeRefusal } from "#src/models/character/TalentUpgradeRefusal";
import { COMBAT_TALENT_ORDER } from "#src/services/character/constants";
import { getTalentRows } from "#src/services/character/getTalentRows";
import { TalentUpgradeRefusalGameTextKeyMap } from "#src/services/character/TalentUpgradeRefusalGameTextKeyMap";
import { upgradeCharacterTalent } from "#src/services/character/upgradeCharacterTalent";
import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { CharacterMenuTalents } from "genshin-interface";
import { fillGameTextValues, GameTextKey } from "genshin-text";

interface Props {
  // The character whose combat talents the panel shows, and whose next level its Upgrade buttons raise
  character: Character;
  // The kit each character's combat talents are read from, the proud skill group each of them names
  characterTalentKits: CharacterTalentKit[];
  // The game's words in the reader's language
  gameText: GameText;
  // The game's material table by item id, which the materials a talent's next level takes are named from
  materialDataMap: ReadonlyMap<number, MaterialData>;
  // The names the stat tables cite, in the reader's language, by their text id
  nameText: Readonly<Record<string, string>>;
  // The game's talent upgrades by proud skill group, which each combat talent's next level is read from
  talentUpgradeMap: TalentUpgradeMap;
}

const characters = defineModel<Character[]>("characters", { required: true });
// The bag and the wallet a talent's next level takes its materials and Mora from
const inventory = defineModel<Inventory>("inventory", { required: true });
const wallet = defineModel<Wallet>("wallet", { required: true });
const { character, characterTalentKits, gameText, materialDataMap, nameText, talentUpgradeMap } = defineProps<Props>();
// The proud skill group each of the character's combat talents names in its kit, which its upgrades are read by
const talentGroupIds = computed(
  () =>
    characterTalentKits.find(({ characterId: kitCharacterId }) => kitCharacterId === character.id)?.talentGroupIds,
);
const toItemCountText = (name: string, count: number) =>
  fillGameTextValues(gameText[GameTextKey.ItemCount], name, count);
// The Talents tab's panel for the chosen character: each combat talent's level, the phase and the cost of its next level,
// And why it cannot rise now, its Upgrade disabled while it cannot
const talentPanel = computed(() => {
  if (!talentGroupIds.value) return undefined;
  const rows = getTalentRows(character, talentGroupIds.value, talentUpgradeMap, {
    inventory: inventory.value,
    wallet: wallet.value,
  });
  return {
    costs: rows.map(({ upgrade }) =>
      upgrade
        ? [
            toItemCountText(gameText[GameTextKey.Mora], upgrade.coinCost),
            ...upgrade.costItems.map(({ count, id }) =>
              toItemCountText(getItemDefinition(id, nameText, materialDataMap).name, count),
            ),
          ]
        : [],
    ),
    // A talent at its last level draws no Upgrade and names no reason, the game showing neither
    isUpgradeDisabled: rows.map(({ refusal }) => refusal !== undefined),
    levelTexts: rows.map(({ level }) => fillGameTextValues(gameText[GameTextKey.LevelFormat], level)),
    phases: rows.map(({ upgrade }) =>
      upgrade ? fillGameTextValues(gameText[GameTextKey.TalentPhaseRequired], upgrade.phase) : "",
    ),
    reasons: rows.map(({ refusal }) =>
      refusal === undefined || refusal === TalentUpgradeRefusal.LastLevel
        ? ""
        : gameText[TalentUpgradeRefusalGameTextKeyMap[refusal]],
    ),
  };
});
const upgradeTalentAt = (index: number) => {
  const talent = COMBAT_TALENT_ORDER[index];
  if (!talentGroupIds.value || !talent) return;
  const raised = upgradeCharacterTalent(
    characters.value,
    character,
    talent,
    talentUpgradeMap[talentGroupIds.value[talent]] ?? [],
    { inventory: inventory.value, wallet: wallet.value },
  );
  characters.value = raised.characters;
  inventory.value = raised.inventory;
  wallet.value = raised.wallet;
};
</script>

<template>
  <CharacterMenuTalents
    v-if="talentPanel"
    :="talentPanel"
    :upgrade-label="gameText[GameTextKey.TalentLevelUp]"
    @upgrade="(index) => upgradeTalentAt(index)"
  />
</template>
