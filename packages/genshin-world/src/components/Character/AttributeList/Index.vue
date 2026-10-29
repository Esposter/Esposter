<script setup lang="ts">
import type { AttributeLine } from "#src/models/character/AttributeLine";
import type { Character } from "#src/models/character/Character";
import type { StatTables } from "#src/models/character/StatTables";
import type { GameText } from "genshin-text";

import { Attribute } from "#src/models/character/Attribute";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { formatWholeNumber } from "#src/services/character/formatWholeNumber";
import { getAttributeDetailGroups } from "#src/services/character/getAttributeDetailGroups";
import { getCharacterAttributeLines } from "#src/services/character/getCharacterAttributeLines";
import { fillGameTextValues, GameTextKey, splitGameTextColors } from "genshin-text";

interface Props {
  // The Adventure Rank, Mora and materials the character's next phase takes, each held against what it takes, none at its last phase
  ascendRows: { label: string; value: string }[];
  character: Character;
  // The game's words in the reader's language
  gameText: GameText;
  // Whether the character can ascend now, at its level cap with the Adventure Rank, Mora and materials its next phase takes
  isAscendable: boolean;
  // Whether the character can be raised a level with its Character EXP materials now
  isLevelUpable: boolean;
  // Whether the character sits at a cap a Masterless Stella Fortuna lifts, with the items to do it
  isLiftable: boolean;
  // The party's stamina, which the tab shows with every character's own attributes
  maxStamina: number;
  // The character's name in the reader's language, which the panel's top names it by
  name: string;
  // The game's tables the character's level cap and attributes are read from
  statTables: StatTables;
  // The bonuses the Traveler holds from the elements it resonated with, given to the Traveler alone
  travelerBonusLines: AttributeLine[];
}

const {
  ascendRows,
  character,
  gameText,
  isAscendable,
  isLevelUpable,
  isLiftable,
  maxStamina,
  name,
  statTables,
  travelerBonusLines,
} = defineProps<Props>();
const emit = defineEmits<{ ascend: []; levelUp: []; lift: [] }>();
const characterData = computed(() => statTables.characterDataMap.get(character.id));
// The level and the cap it is at, the cap in the dimmer colour the game's own line sets it in
const levelSegments = computed(() =>
  splitGameTextColors(
    fillGameTextValues(
      gameText[GameTextKey.CharacterLevelWithMax],
      `${character.level}`,
      `${characterData.value?.ascensionPhases[character.ascension]?.maxLevel ?? ""}`,
    ),
  ),
);
// The tab's attributes: the base five the panel shows first, each as the game writes it, Max HP, ATK, DEF, Elemental
// Mastery and Max Stamina whole, then the advanced and elemental groups under them, each a percentage to one place
const attributes = computed(() =>
  computeCharacterAttributes(getCharacterAttributeLines(character, statTables, travelerBonusLines)),
);
const rows = computed(() => {
  const { attack, attributeTotalMap, defense, maxHealth } = attributes.value;
  return [
    { label: gameText[GameTextKey.AttributeMaxHealth], value: formatWholeNumber(maxHealth) },
    { label: gameText[GameTextKey.AttributeAttack], value: formatWholeNumber(attack) },
    { label: gameText[GameTextKey.AttributeDefense], value: formatWholeNumber(defense) },
    {
      label: gameText[GameTextKey.AttributeElementalMastery],
      value: formatWholeNumber(attributeTotalMap[Attribute.ElementalMastery]),
    },
    { label: gameText[GameTextKey.AttributeMaxStamina], value: `${maxStamina}` },
  ];
});
// Details is pressed to open the three groups beneath the summary, and pressed again to close them
const isDetailsOpen = ref(false);
const detailGroups = computed(() =>
  getAttributeDetailGroups(attributes.value.attributeTotalMap, gameText, isDetailsOpen.value),
);
</script>

<template>
  <!-- The Attributes tab's panel: the character's name and level over its cap, the experience bar, and its base attributes
       as the game shows them. Details opens its groups beneath, each under its title -->
  <div class="attribute-list">
    <p class="name">{{ name }}</p>
    <div class="stars" aria-hidden="true">
      <svg v-for="star in characterData?.rarity ?? 0" :key="star" viewBox="0 0 20 20">
        <path
          d="M10 0C10.8 7.2 12.8 9.2 20 10C12.8 10.8 10.8 12.8 10 20C9.2 12.8 7.2 10.8 0 10C7.2 9.2 9.2 7.2 10 0Z"
        />
      </svg>
    </div>
    <p class="level">
      <span v-for="({ color, text }, index) of levelSegments" :key="index" :style="{ color }">{{ text }}</span>
    </p>
    <div class="experience" />
    <dl class="rows">
      <div v-for="{ label, value } of rows" :key="label" class="row">
        <dt>{{ label }}</dt>
        <dd class="value">{{ value }}</dd>
      </div>
    </dl>
    <button v-if="isLevelUpable" type="button" class="details" @click="emit('levelUp')">
      {{ gameText[GameTextKey.LevelUp] }}
    </button>
    <button type="button" class="details" @click="isDetailsOpen = !isDetailsOpen">
      {{ gameText[GameTextKey.CharacterDetails] }}
    </button>
    <p class="friendship">{{ gameText[GameTextKey.Friendship] }}</p>
    <div class="friendship-bar" />
    <button type="button" class="lift cream-pill" :disabled="!isLiftable" @click="emit('lift')">
      {{ gameText[GameTextKey.AscensionLimit] }}
    </button>
    <dl v-if="ascendRows.length" class="rows">
      <div v-for="{ label, value } of ascendRows" :key="label" class="row">
        <dt>{{ label }}</dt>
        <dd class="value">{{ value }}</dd>
      </div>
    </dl>
    <button v-if="ascendRows.length" type="button" class="details" :disabled="!isAscendable" @click="emit('ascend')">
      {{ gameText[GameTextKey.CharacterAscend] }}
    </button>
    <section v-for="{ rows: groupRows, title } of detailGroups" :key="title">
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

<style scoped src="genshin-interface/styles/creamPill.css"></style>

<style scoped>
/* Measured off the English PC client's character screen at 21:9 (references/character-attributes-session.png), in units
   from the panel's left edge: its name centred 148 from the frame's top, its level 225, its experience bar 251 and 3
   thick, its five base rows on a 36-unit pitch from 298, every value flush with the panel's right edge. The bar's
   colour is #38dae5, read off the reference's column */
.attribute-list {
  display: flex;
  flex-direction: column;
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

.stars {
  display: flex;
  gap: calc(var(--unit) * 6.75);
  padding-left: calc(var(--unit) * 27.75);
  margin-top: calc(var(--unit) * 9.6);
}

.stars svg {
  width: calc(var(--unit) * 19.5);
  height: calc(var(--unit) * 19.5);
  fill: #fff;
}

.level {
  margin: calc(var(--unit) * 5.9) 0 0;
  font-size: calc(var(--unit) * 27);
  font-weight: 600;
  line-height: calc(var(--unit) * 36);
}

.experience {
  width: 100%;
  height: calc(var(--unit) * 3);
  margin-top: calc(var(--unit) * 10);
  background: #38dae5;
}

/* The two pills share their centring and the pointer; each sets its own size, fill and colour */
.details,
.lift {
  padding: 0;
  text-align: center;
  cursor: pointer;
}

/* The game's outlined pill, a hairline round a faint lightening, its word in the cream the frame's words are */
.details {
  display: block;
  font: inherit;
  width: 100%;
  height: calc(var(--unit) * 40);
  margin-top: calc(var(--unit) * 17.5);
  border: calc(var(--unit) * 1.5) solid rgb(255 255 255 / 0.25);
  border-radius: calc(var(--unit) * 20);
  background: rgb(255 255 255 / 0.08);
  color: rgb(236 229 216);
  line-height: calc(var(--unit) * 40);
}

/* The Friendship row under Details: its word 27 units in from the panel's edge, its lavender bar across the panel, both
   read off the reference's pixels at 1080 high. Its level is not drawn, since the panel is not given it */
.friendship {
  margin: calc(var(--unit) * 17) 0 0;
  padding-left: calc(var(--unit) * 27);
  font-size: calc(var(--unit) * 26);
  line-height: calc(var(--unit) * 36);
}

.friendship-bar {
  height: calc(var(--unit) * 4);
  margin-top: calc(var(--unit) * 3.25);
  background: #ad9ff8;
}

/* The game's cream pill at the foot of the frame, 68 units in from the panel's left edge and 859 down from its top, read
   off the reference's pixels at 1080 high; its word is the panel's dark slate, and its size and weight are the cream pill
   sheet's, so it inherits only the family */
.lift {
  position: absolute;
  top: calc(var(--unit) * 859);
  left: calc(var(--unit) * 68);
  width: calc(var(--unit) * 266);
  height: calc(var(--unit) * 49);
  margin: 0;
  border: 0;
  background: #ded5c4;
  color: #3e404d;
  font-family: inherit;
  line-height: calc(var(--unit) * 49);
}

.title {
  margin: 0 0 calc(var(--unit) * 8);
  font-size: calc(var(--unit) * 22);
  opacity: 0.7;
}

.rows {
  margin: calc(var(--unit) * 5) 0 0;
}

.experience + .rows {
  margin-top: calc(var(--unit) * 28);
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
