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
  // The character's name in the reader's language, which the panel's top names it by
  name: string;
  // The game's words in the reader's language
  gameText: GameText;
  // The party's stamina, which the tab shows with every character's own attributes
  maxStamina: number;
  // The game's tables the character's level cap and attributes are read from
  statTables: StatTables;
}

const { character, gameText, maxStamina, name, statTables } = defineProps<Props>();
const levelText = computed(() =>
  fillGameTextValues(
    gameText[GameTextKey.LevelFormat],
    `${character.level}/${statTables.characterDataMap.get(character.id)?.ascensionPhases[character.ascension]?.maxLevel ?? ""}`,
  ),
);
// The tab's attributes: the base five the panel shows first, each as the game writes it, Max HP, ATK, DEF, Elemental
// Mastery and Max Stamina whole, then the advanced and elemental groups under them, each a percentage to one place
const attributes = computed(() => computeCharacterAttributes(getCharacterAttributeLines(character, statTables)));
const rows = computed(() => {
  const { attack, attributeTotalMap, defense, maxHealth } = attributes.value;
  return [
    { label: gameText[GameTextKey.AttributeMaxHealth], value: `${Math.round(maxHealth)}` },
    { label: gameText[GameTextKey.AttributeAttack], value: `${Math.round(attack)}` },
    { label: gameText[GameTextKey.AttributeDefense], value: `${Math.round(defense)}` },
    {
      label: gameText[GameTextKey.AttributeElementalMastery],
      value: `${Math.round(attributeTotalMap[Attribute.ElementalMastery])}`,
    },
    { label: gameText[GameTextKey.AttributeMaxStamina], value: `${maxStamina}` },
  ];
});
const groups = computed(() => {
  const { attributeTotalMap } = attributes.value;
  const toPercentRows = (attributeGameTextKeys: readonly (readonly [Attribute, GameTextKey])[]) =>
    attributeGameTextKeys.map(([attribute, gameTextKey]) => ({
      label: gameText[gameTextKey],
      value: `${(attributeTotalMap[attribute] * 100).toFixed(1)}%`,
    }));
  return [
    { rows: toPercentRows(ADVANCED_ATTRIBUTE_GAME_TEXT_KEYS), title: gameText[GameTextKey.AttributeGroupAdvanced] },
    { rows: toPercentRows(ELEMENTAL_ATTRIBUTE_GAME_TEXT_KEYS), title: gameText[GameTextKey.AttributeGroupElemental] },
  ];
});
</script>

<template>
  <!-- The Attributes tab's panel: the character's name and level over its cap, the experience bar, and its base attributes
       as the game shows them. Its advanced and elemental groups sit beneath, each under its title -->
  <div class="attribute-list">
    <p class="name">{{ name }}</p>
    <p class="level">{{ levelText }}</p>
    <div class="experience" />
    <dl class="rows">
      <div v-for="{ label, value } of rows" :key="label" class="row">
        <dt>{{ label }}</dt>
        <dd class="value">{{ value }}</dd>
      </div>
    </dl>
    <section v-for="{ rows: groupRows, title } of groups" :key="title">
      <h2 class="title">{{ title }}</h2>
      <dl class="rows">
        <div v-for="{ label, value } of groupRows" :key="label" class="row">
          <dt>{{ label }}</dt>
          <dd class="value">{{ value }}</dd>
        </div>
      </dl>
    </section>
  </div>
</template>

<style scoped>
/* Measured off the English PC client's character screen at 21:9 (references/character-attributes-session.png), in units
   from the panel's left edge: its name centred 148 from the frame's top, its level 225, its experience bar 251 and 3
   thick, its five base rows on a 36-unit pitch from 298, every value flush with the panel's right edge. Provisional
   where the reference's colours are not sampled yet */
.attribute-list {
  display: flex;
  flex-direction: column;
  gap: calc(var(--unit) * 14);
  padding-top: calc(var(--unit) * 6);
  font-size: calc(var(--unit) * 26);
}

.name {
  margin: 0;
  font-size: calc(var(--unit) * 36);
  font-weight: 600;
  line-height: calc(var(--unit) * 40);
  text-shadow: 0 calc(var(--unit) * 1) calc(var(--unit) * 3) rgb(0 0 0 / 0.4);
}

.level {
  margin: calc(var(--unit) * 24) 0 0;
  font-size: calc(var(--unit) * 30);
  font-weight: 600;
  line-height: calc(var(--unit) * 36);
}

.experience {
  width: 100%;
  height: calc(var(--unit) * 3);
  background: #4fc3d9;
}

.title {
  margin: 0 0 calc(var(--unit) * 8);
  font-size: calc(var(--unit) * 22);
  opacity: 0.7;
}

.rows {
  margin: calc(var(--unit) * 5) 0 0;
}

.row {
  display: flex;
  justify-content: space-between;
  line-height: calc(var(--unit) * 36);
}

.value {
  margin: 0;
}
</style>
