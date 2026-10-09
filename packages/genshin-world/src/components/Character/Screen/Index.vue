<script setup lang="ts">
import type { Character } from "#src/models/character/Character";
import type { StatTables } from "#src/models/character/StatTables";
import type { GameText } from "genshin-text";

import CharacterAttributeList from "#src/components/Character/AttributeList/Index.vue";
import CharacterProfile from "#src/components/Character/Profile/Index.vue";
import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { Attribute } from "#src/models/character/Attribute";
import { CombatTalent } from "#src/models/character/CombatTalent";
import { CharacterMenuTabGameTextKeyMap } from "#src/services/character/CharacterMenuTabGameTextKeyMap";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import {
  ARTIFACT_SLOT_ORDER,
  COMBAT_TALENT_ORDER,
  TRAVELER_CHARACTER_ID,
  WHOLE_ATTRIBUTES,
} from "#src/services/character/constants";
import { getGrownAttributeLines } from "#src/services/character/getGrownAttributeLines";
import { LOGIN_TRAVELER_GENDER } from "#src/services/login/constants";
import { CONSTELLATION_COUNT } from "#src/services/wish/constants";
import {
  CharacterMenu,
  CharacterMenuArtifacts,
  CharacterMenuConstellation,
  CharacterMenuTab,
  CharacterMenuTabs,
  CharacterMenuTalents,
  CharacterMenuWeapons,
  GameScreen,
} from "genshin-interface";
import { fillGameTextValues, fillLinePlaceholders, GameLanguage, GameTextKey } from "genshin-text";

interface Props {
  // The character the screen opens on, the one on the field
  activeCharacterId: number;
  // The player's characters, across the screen's top in the order given
  characters: Character[];
  // The Companionship EXP each character has earned, by its id, from which its Friendship Level is read
  companionshipExpMap?: ReadonlyMap<number, number>;
  // Where the host serves the game's published data, which the Profile tab reads its character's record from
  gameDataBaseUrl: string;
  // The game's words in the reader's language
  gameText: GameText;
  // The tab the screen opens on, Attributes as the game's C opens it
  initialTab: CharacterMenuTab;
  // The reader's game language, whose text the Profile tab shows
  language?: GameLanguage;
  // The party's stamina, which the Attributes tab shows with every character's own attributes
  maxStamina: number;
  // The names the stat tables cite, in the reader's language, by their text id
  nameText: Readonly<Record<string, string>>;
  // The game's tables the characters' attributes are summed from
  statTables: StatTables;
}

// What the host lays over the screen for the character it shows, outside the game's own screen
defineSlots<{ default?: (props: { characterId: number }) => unknown }>();
const {
  activeCharacterId,
  characters,
  companionshipExpMap = new Map<number, number>(),
  gameDataBaseUrl,
  gameText,
  initialTab,
  language = GameLanguage.English,
  maxStamina,
  nameText,
  statTables,
} = defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
const characterId = ref(activeCharacterId);
const tab = ref(initialTab);
const character = computed(() => characters.find(({ id }) => id === characterId.value));
// The Traveler's name is the game's own, and every other character's is the name its table cites
const menuEntries = computed(() =>
  characters.map(({ id }) => ({
    id,
    name:
      id === TRAVELER_CHARACTER_ID
        ? fillLinePlaceholders(gameText[GameTextKey.Traveler], "", LOGIN_TRAVELER_GENDER)
        : nameText[statTables.characterDataMap.get(id)?.nameTextId ?? ""] || "",
  })),
);
const characterName = computed(() => menuEntries.value.find(({ id }) => id === characterId.value)?.name ?? "");
const tabLabels = computed(() =>
  Object.fromEntries(CharacterMenuTabs.map((menuTab) => [menuTab, gameText[CharacterMenuTabGameTextKeyMap[menuTab]]])),
);
// The weapon the character wields at its level and phase: its name, base ATK and secondary attribute, as the Weapons tab
// Shows them
const weaponPanel = computed(() => {
  const weapon = character.value?.weapon;
  const weaponData = weapon && statTables.weaponDataMap.get(weapon.id);
  if (!weapon || !weaponData) return undefined;
  // Every line of an attribute is summed, since an ascension phase can add to the base ATK the weapon's level grows
  const { attributeTotalMap } = computeCharacterAttributes(
    getGrownAttributeLines(weaponData, statTables.weaponGrowCurveMap, weapon.level, weapon.ascension),
  );
  // The secondary attribute is the one the weapon grows beside its base ATK, written whole or as a percentage as the
  // Game writes it, and nothing for a weapon that grows none
  const subStatAttribute = weaponData.growAttributes.find(
    ({ attribute }) => attribute !== Attribute.BaseAttack,
  )?.attribute;
  const subStatValue =
    subStatAttribute === undefined
      ? ""
      : WHOLE_ATTRIBUTES.includes(subStatAttribute)
        ? `${Math.round(attributeTotalMap[subStatAttribute])}`
        : `${(attributeTotalMap[subStatAttribute] * 100).toFixed(1)}%`;
  const maxLevel = weaponData.ascensionPhases[weapon.ascension]?.maxLevel ?? weapon.level;
  return {
    ascension: weapon.ascension,
    baseAttack: Math.round(attributeTotalMap[Attribute.BaseAttack]),
    levelText: fillGameTextValues(gameText[GameTextKey.LevelFormat], `${weapon.level}/${maxLevel}`),
    name: nameText[weaponData.nameTextId] || "",
    rarity: weaponData.rarity,
    refinement: weapon.refinement,
    subStatValue,
  };
});
// Which artifact slots the character wears one in, in the game's order
const artifactsEquipped = computed(() =>
  ARTIFACT_SLOT_ORDER.map((slot) => character.value?.artifacts.some((artifact) => artifact.slot === slot) ?? false),
);
// Which of the six constellations are activated, the first the character's count of them
const constellationsActivated = computed(() =>
  Array.from({ length: CONSTELLATION_COUNT }, (_value, index) => index < (character.value?.constellationCount ?? 0)),
);
// Each combat talent's level in the order the Talents tab lists them
const talentLevels = computed(() => COMBAT_TALENT_ORDER.map((talent) => character.value?.talentLevels[talent] ?? 0));
</script>

<template>
  <!-- The character screen, the C key's, a dialog over the world: the player's characters, the one on the field chosen
       First, the open tab's panel for the chosen one, the Profile's aside, and the way back -->
  <GameScreen role="dialog" aria-modal="true" :aria-label="gameText[GameTextKey.Character]">
    <CharacterMenu v-model:character-id="characterId" v-model:tab="tab" :characters="menuEntries" :tab-labels>
      <CharacterAttributeList
        v-if="character && tab === CharacterMenuTab.Attributes"
        :character
        :game-text
        :max-stamina
        :name="characterName"
        :stat-tables
      />
      <CharacterMenuWeapons v-else-if="weaponPanel && tab === CharacterMenuTab.Weapons" :="weaponPanel" />
      <CharacterMenuArtifacts
        v-else-if="character && tab === CharacterMenuTab.Artifacts"
        :equipped="artifactsEquipped"
      />
      <CharacterMenuConstellation
        v-else-if="character && tab === CharacterMenuTab.Constellation"
        :activated="constellationsActivated"
      />
      <CharacterMenuTalents v-else-if="character && tab === CharacterMenuTab.Talents" :levels="talentLevels" />
      <CharacterProfile
        v-else-if="character && tab === CharacterMenuTab.Profile"
        :key="`${character.id}-${language}-${companionshipExpMap.get(character.id) ?? 0}`"
        :avatar-id="character.id"
        :friendship-exp="companionshipExpMap.get(character.id) ?? 0"
        :game-data-base-url
        :game-text
        :language
        :name-text
      />
    </CharacterMenu>
    <span class="grid" />
    <p class="training-guide">{{ gameText[GameTextKey.TrainingGuide] }}</p>
    <button class="close" :aria-label="gameText[GameTextKey.Back]" type="button" @click="emit('close')">×</button>
    <slot :character-id />
  </GameScreen>
</template>

<style scoped>
/* The foot's pieces, measured off the same frame: the grid's disc centred 148 units from the left and 1006 from the top,
   and the Training Guide pill from 200 units, 49 high. Their colours are provisional */
.grid {
  position: absolute;
  top: calc(var(--unit) * 978);
  left: calc(var(--unit) * 120);
  width: calc(var(--unit) * 56);
  height: calc(var(--unit) * 56);
  border-radius: 50%;
  background: rgb(236 229 216 / 0.3);
}

.training-guide {
  position: absolute;
  top: calc(var(--unit) * 983);
  left: calc(var(--unit) * 200);
  margin: 0;
  padding: 0 calc(var(--unit) * 26);
  border-radius: calc(var(--unit) * 25);
  background: rgb(236 229 216 / 0.9);
  color: #3b4255;
  font-size: calc(var(--unit) * 26);
  font-weight: 600;
  line-height: calc(var(--unit) * 49);
}

/* The way back's centre is 49 units from the top and 149 from the right, off the English client's character screen at
   21:9 (references/character-attributes-session.png). Its size and colours are provisional, as the quest screen's */
.close {
  position: absolute;
  top: calc(var(--unit) * 21);
  right: calc(var(--unit) * 121);
  width: calc(var(--unit) * 56);
  height: calc(var(--unit) * 56);
  border: none;
  border-radius: 50%;
  background: #ece5d8;
  color: #3b4255;
  cursor: inherit;
  font: inherit;
  font-size: calc(var(--unit) * 36);
  font-weight: 600;
  line-height: 1;
}
</style>
