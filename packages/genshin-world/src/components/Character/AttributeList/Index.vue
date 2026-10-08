<script setup lang="ts">
import type { Character } from "#src/models/character/Character";
import type { StatTables } from "#src/models/character/StatTables";
import type { GameText } from "genshin-text";

import { Attribute } from "#src/models/character/Attribute";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import {
  ADVANCED_ATTRIBUTE_GAME_TEXT_KEYS,
  ELEMENTAL_ATTRIBUTE_GAME_TEXT_KEYS,
} from "#src/services/character/constants";
import { getCharacterAttributeLines } from "#src/services/character/getCharacterAttributeLines";
import { fillGameTextValues, GameTextKey } from "genshin-text";

interface Props {
  character: Character;
  // The game's words in the reader's language
  gameText: GameText;
  // The party's stamina, which the tab shows with every character's own attributes
  maxStamina: number;
  // The game's tables the character's level cap and attributes are read from
  statTables: StatTables;
}

const { character, gameText, maxStamina, statTables } = defineProps<Props>();
const levelText = computed(() =>
  fillGameTextValues(
    gameText[GameTextKey.LevelFormat],
    `${character.level}/${statTables.characterDataMap.get(character.id)?.ascensionPhases[character.ascension]?.maxLevel ?? ""}`,
  ),
);
// The tab's attributes in the groups its details sort them into, each as the game writes it: Max HP, ATK, DEF,
// Elemental Mastery and Max Stamina whole, every other a percentage to one place
const groups = computed(() => {
  const attributeLines = getCharacterAttributeLines(character, statTables);
  const { attack, attributeTotalMap, defense, maxHealth } = computeCharacterAttributes(attributeLines);
  const toPercentRows = (attributeGameTextKeys: readonly (readonly [Attribute, GameTextKey])[]) =>
    attributeGameTextKeys.map(([attribute, gameTextKey]) => ({
      label: gameText[gameTextKey],
      value: `${(attributeTotalMap[attribute] * 100).toFixed(1)}%`,
    }));
  return [
    {
      rows: [
        { label: gameText[GameTextKey.AttributeMaxHealth], value: `${Math.round(maxHealth)}` },
        { label: gameText[GameTextKey.AttributeAttack], value: `${Math.round(attack)}` },
        { label: gameText[GameTextKey.AttributeDefense], value: `${Math.round(defense)}` },
        {
          label: gameText[GameTextKey.AttributeElementalMastery],
          value: `${Math.round(attributeTotalMap[Attribute.ElementalMastery])}`,
        },
        { label: gameText[GameTextKey.AttributeMaxStamina], value: `${maxStamina}` },
      ],
      title: gameText[GameTextKey.AttributeGroupBase],
    },
    { rows: toPercentRows(ADVANCED_ATTRIBUTE_GAME_TEXT_KEYS), title: gameText[GameTextKey.AttributeGroupAdvanced] },
    { rows: toPercentRows(ELEMENTAL_ATTRIBUTE_GAME_TEXT_KEYS), title: gameText[GameTextKey.AttributeGroupElemental] },
  ];
});
</script>

<template>
  <!-- The Attributes tab's panel: the character's level over its cap, and its attributes by group as its details list
       Them -->
  <div class="attribute-list">
    <p class="level">{{ levelText }}</p>
    <section v-for="{ rows, title } of groups" :key="title">
      <h2 class="title">{{ title }}</h2>
      <dl class="rows">
        <div v-for="{ label, value } of rows" :key="label" class="row">
          <dt>{{ label }}</dt>
          <dd class="value">{{ value }}</dd>
        </div>
      </dl>
    </section>
  </div>
</template>

<style scoped>
/* Provisional: every size and colour here, until the character screen's passes measure them off a recording of the
   English client at 1080 high */
.attribute-list {
  display: flex;
  flex-direction: column;
  gap: calc(var(--unit) * 20);
  font-size: calc(var(--unit) * 22);
}

.level {
  margin: 0;
  font-size: calc(var(--unit) * 32);
  font-weight: 600;
}

.title {
  margin: 0 0 calc(var(--unit) * 8);
  font-size: calc(var(--unit) * 22);
  opacity: 0.7;
}

.rows {
  margin: 0;
}

.row {
  display: flex;
  justify-content: space-between;
  padding: calc(var(--unit) * 8) calc(var(--unit) * 12);
}

.row:nth-child(odd) {
  background: rgb(255 255 255 / 0.06);
}

.value {
  margin: 0;
}
</style>
