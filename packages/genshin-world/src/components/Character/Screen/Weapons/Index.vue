<script setup lang="ts">
import type { Character } from "#src/models/character/Character";
import type { StatTables } from "#src/models/character/StatTables";
import type { GameText } from "genshin-text";

import { Attribute } from "#src/models/character/Attribute";
import { formatAttributeValue } from "#src/services/character/formatAttributeValue";
import { formatWholeNumber } from "#src/services/character/formatWholeNumber";
import { getAttributeLabel } from "#src/services/character/getAttributeLabel";
import { getSecondaryAttribute } from "#src/services/character/getSecondaryAttribute";
import { getWeaponAttributeTotals } from "#src/services/weapon/getWeaponAttributeTotals";
import { WeaponTypeNameGameTextKeyMap } from "#src/services/weapon/WeaponTypeNameGameTextKeyMap";
import { CharacterMenuWeapons } from "genshin-interface";
import { fillGameTextValues, GameTextKey } from "genshin-text";

interface Props {
  // The character whose weapon the panel shows, the one it wields at its level and phase
  character: Character;
  // The game's words in the reader's language
  gameText: GameText;
  // The names the stat tables cite, in the reader's language, by their text id
  nameText: Readonly<Record<string, string>>;
  // The game's tables the weapon's base ATK and the attribute it grows beside it are read from
  statTables: StatTables;
}

const { character, gameText, nameText, statTables } = defineProps<Props>();
// The weapon the character wields at its level and phase: its name, base ATK and secondary attribute, as the Weapons tab
// Shows them
const weaponPanel = computed(() => {
  const weapon = character.weapon;
  const weaponData = weapon && statTables.weaponDataMap.get(weapon.id);
  if (!weapon || !weaponData) return undefined;
  const attributeTotalMap = getWeaponAttributeTotals(
    weaponData,
    statTables.weaponGrowCurveMap,
    weapon.level,
    weapon.ascension,
  );
  // The secondary attribute is the one the weapon grows beside its base ATK, written whole or as a percentage as the
  // Game writes it, captioned by the label the Weapon screen draws it under, and nothing for a weapon that grows none
  const subStatAttribute = getSecondaryAttribute(weaponData);
  const subStatValue =
    subStatAttribute === undefined ? "" : formatAttributeValue(subStatAttribute, attributeTotalMap[subStatAttribute]);
  const maxLevel = weaponData.ascensionPhases[weapon.ascension]?.maxLevel ?? weapon.level;
  return {
    ascension: weapon.ascension,
    baseAttack: formatWholeNumber(attributeTotalMap[Attribute.BaseAttack]),
    baseAttackLabel: gameText[GameTextKey.AttributeBaseAttack],
    enhanceLabel: gameText[GameTextKey.WeaponEnhance],
    kind: gameText[WeaponTypeNameGameTextKeyMap[weaponData.weaponType]],
    levelText: fillGameTextValues(gameText[GameTextKey.LevelFormat], `${weapon.level}/${maxLevel}`),
    name: nameText[weaponData.nameTextId] || "",
    rarity: weaponData.rarity,
    refinement: weapon.refinement,
    subStatLabel: subStatAttribute === undefined ? "" : getAttributeLabel(subStatAttribute, gameText),
    subStatValue,
    switchLabel: gameText[GameTextKey.QuickSwapSwitch],
  };
});
</script>

<template>
  <CharacterMenuWeapons v-if="weaponPanel" :="weaponPanel" />
</template>
