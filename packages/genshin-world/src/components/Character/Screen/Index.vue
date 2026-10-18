<script setup lang="ts">
import type { AttributeLine } from "#src/models/character/AttributeLine";
import type { Character } from "#src/models/character/Character";
import type { CharacterTalentKit } from "#src/models/character/CharacterTalentKit";
import type { Constellation } from "#src/models/character/Constellation";
import type { StatTables } from "#src/models/character/StatTables";
import type { TalentUpgradeMap } from "#src/models/character/TalentUpgradeMap";
import type { Element } from "#src/models/Element";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { GameText } from "genshin-text";

import CharacterAttributeList from "#src/components/Character/AttributeList/Index.vue";
import CharacterProfile from "#src/components/Character/Profile/Index.vue";
import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { Attribute } from "#src/models/character/Attribute";
import { CombatTalent } from "#src/models/character/CombatTalent";
import { activateConstellation } from "#src/services/character/activateConstellation";
import { CharacterMenuTabGameTextKeyMap } from "#src/services/character/CharacterMenuTabGameTextKeyMap";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import {
  ARTIFACT_SLOT_ORDER,
  COMBAT_TALENT_ORDER,
  MASTERLESS_LEVEL_LIFTS,
  MASTERLESS_STELLA_FORTUNA_ID,
  TRAVELER_CHARACTER_ID,
  WHOLE_ATTRIBUTES,
} from "#src/services/character/constants";
import { getCharacterElement } from "#src/services/character/getCharacterElement";
import { getConstellationActivationRefusal } from "#src/services/character/getConstellationActivationRefusal";
import { getGrownAttributeLines } from "#src/services/character/getGrownAttributeLines";
import { getTalentRows } from "#src/services/character/getTalentRows";
import { levelUpCharacter } from "#src/services/character/levelUpCharacter";
import { liftCharacterLevel } from "#src/services/character/liftCharacterLevel";
import { TalentUpgradeRefusalGameTextKeyMap } from "#src/services/character/TalentUpgradeRefusalGameTextKeyMap";
import { upgradeCharacterTalent } from "#src/services/character/upgradeCharacterTalent";
import { checkIsItemCountsHeld } from "#src/services/inventory/checkIsItemCountsHeld";
import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { ElementMarkPathMap } from "#src/services/loading/ElementMarkPathMap";
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
  // The constellations each character's set holds, by its id, the ones its Activate button presses the next of
  characterIdConstellationsMap: ReadonlyMap<number, Constellation[]>;
  // The kit each character's combat talents are read from, the proud skill group each of them names
  characterTalentKits: CharacterTalentKit[];
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
  // The game's material table by item id, which the materials a talent's next level takes are named from
  materialDataMap: ReadonlyMap<number, MaterialData>;
  // The party's stamina, which the Attributes tab shows with every character's own attributes
  maxStamina: number;
  // The names the stat tables cite, in the reader's language, by their text id
  nameText: Readonly<Record<string, string>>;
  // The game's tables the characters' attributes are summed from
  statTables: StatTables;
  // The game's talent upgrades by proud skill group, which each combat talent's next level is read from
  talentUpgradeMap: TalentUpgradeMap;
  // The element the Traveler holds from the statue it resonated with last, none before any resonance
  // The bonuses the Traveler holds from the elements it resonated with, once Welkin Moon's Homecoming is done
  travelerBonusLines?: AttributeLine[];
  travelerElement?: Element;
}

// What the host lays behind the screen, the scene the open tab is shown over, and over it for the character it shows,
// Outside the game's own screen
defineSlots<{
  default?: (props: { characterId: number }) => unknown;
  scene?: (props: { tab: CharacterMenuTab }) => unknown;
}>();
const {
  activeCharacterId,
  characterIdConstellationsMap,
  characterTalentKits,
  companionshipExpMap = new Map<number, number>(),
  gameDataBaseUrl,
  gameText,
  initialTab,
  language = GameLanguage.English,
  materialDataMap,
  maxStamina,
  nameText,
  statTables,
  talentUpgradeMap,
  travelerBonusLines = [],
  travelerElement,
} = defineProps<Props>();
// The player's characters, across the screen's top in the order given, a character's activated constellation and a
// Talent's raised level written back into them
const characters = defineModel<Character[]>("characters", { required: true });
// The bag and the wallet a talent's next level takes its materials and Mora from
const inventory = defineModel<Inventory>("inventory", { required: true });
const wallet = defineModel<Wallet>("wallet", { required: true });
const emit = defineEmits<{ close: [] }>();
const characterId = ref(activeCharacterId);
const tab = ref(initialTab);
const character = computed(() => characters.value.find(({ id }) => id === characterId.value));
// The Traveler's name is the game's own, and every other character's is the name its table cites
const menuEntries = computed(() =>
  characters.value.map(({ id }) => ({
    id,
    name:
      id === TRAVELER_CHARACTER_ID
        ? fillLinePlaceholders(gameText[GameTextKey.Traveler], "", LOGIN_TRAVELER_GENDER)
        : nameText[statTables.characterDataMap.get(id)?.nameTextId ?? ""] || "",
  })),
);
const characterName = computed(() => menuEntries.value.find(({ id }) => id === characterId.value)?.name ?? "");
// The element mark at the chosen character's name, its element's or, for the Traveler, its alignment's, none while it has none
const elementMarkPath = computed(() => {
  const element = getCharacterElement(characterId.value, statTables.characterDataMap, travelerElement);
  return element === undefined ? undefined : ElementMarkPathMap[element];
});
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
// The proud skill group each of the character's combat talents names in its kit, which its upgrades are read by
const talentGroupIds = computed(
  () =>
    characterTalentKits.find(({ characterId: kitCharacterId }) => kitCharacterId === character.value?.id)
      ?.talentGroupIds,
);
const toItemCountText = (name: string, count: number) =>
  fillGameTextValues(gameText[GameTextKey.ItemCount], name, count);
// The Talents tab's panel for the chosen character: each combat talent's level, the phase and the cost of its next level,
// And why it cannot rise now, its Upgrade disabled while it cannot
const talentPanel = computed(() => {
  if (!character.value || !talentGroupIds.value) return undefined;
  const rows = getTalentRows(character.value, talentGroupIds.value, talentUpgradeMap, {
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
    isUpgradeDisabled: rows.map(({ refusal }) => refusal !== undefined),
    levels: rows.map(({ level }) => level),
    phases: rows.map(({ upgrade }) =>
      upgrade ? fillGameTextValues(gameText[GameTextKey.TalentPhaseRequired], upgrade.phase) : "",
    ),
    reasons: rows.map(({ refusal }) =>
      refusal === undefined ? "" : gameText[TalentUpgradeRefusalGameTextKeyMap[refusal]],
    ),
  };
});
// The combat talent the Talents tab's Upgrade raises by one, which only a press on an enabled row can reach, so the raise
// Never refuses
// The chosen character raised one level with its Character EXP materials, or undefined where that is refused now
const levelUpResult = computed(() => {
  if (!character.value) return undefined;
  const maxLevel = statTables.characterDataMap.get(character.value.id)?.ascensionPhases[character.value.ascension]
    ?.maxLevel;
  return maxLevel === undefined
    ? undefined
    : levelUpCharacter(character.value, { inventory: inventory.value, maxLevel, wallet: wallet.value });
});
// The chosen character raised one level, with the bag's materials and the wallet's Mora taken and the character written back
const levelUpCharacterAt = () => {
  const raised = levelUpResult.value;
  if (!raised) return;
  characters.value = characters.value.map((item) => (item.id === raised.character.id ? raised.character : item));
  inventory.value = raised.inventory;
  wallet.value = raised.wallet;
};
// Whether the chosen character sits at a level cap a Masterless Stella Fortuna lifts, with the items in the bag for it
const isLiftable = computed(() => {
  const liftLevel = character.value ? MASTERLESS_LEVEL_LIFTS.get(character.value.level) : undefined;
  return (
    liftLevel !== undefined &&
    checkIsItemCountsHeld(inventory.value.items, [{ count: liftLevel.count, id: MASTERLESS_STELLA_FORTUNA_ID }], 1)
  );
});
// The chosen character lifted past its cap, with the bag's items taken and the character written back in its place
const liftCharacter = () => {
  if (!character.value || !isLiftable.value) return;
  const lifted = liftCharacterLevel(character.value, { inventory: inventory.value });
  characters.value = characters.value.map((item) => (item.id === lifted.character.id ? lifted.character : item));
  inventory.value = lifted.inventory;
};
const upgradeTalentAt = (index: number) => {
  const talent = COMBAT_TALENT_ORDER[index];
  if (!character.value || !talentGroupIds.value || !talent) return;
  const raised = upgradeCharacterTalent(
    characters.value,
    character.value,
    talent,
    talentUpgradeMap[talentGroupIds.value[talent]] ?? [],
    { inventory: inventory.value, wallet: wallet.value },
  );
  characters.value = raised.characters;
  inventory.value = raised.inventory;
  wallet.value = raised.wallet;
};
// The set the Activate button presses the next of, and whether that is refused now, a character with no set refused too
const constellations = computed(() => characterIdConstellationsMap.get(characterId.value) ?? []);
const isActivateDisabled = computed(
  () => !character.value || getConstellationActivationRefusal(character.value, constellations.value) !== undefined,
);
// The next constellation activated, the character written back in its place
const activate = () => {
  characters.value = characters.value.map((item) =>
    item.id === characterId.value ? activateConstellation(item, constellations.value) : item,
  );
};
</script>

<template>
  <!-- The character screen, the C key's, a dialog over the world: the player's characters, the one on the field chosen
       First, the open tab's panel for the chosen one, the Profile's aside, and the way back -->
  <GameScreen role="dialog" aria-modal="true" :aria-label="gameText[GameTextKey.Character]">
    <slot name="scene" :tab />
    <CharacterMenu
      v-model:character-id="characterId"
      v-model:tab="tab"
      :characters="menuEntries"
      :element-mark-path
      :tab-labels
    >
      <CharacterAttributeList
        v-if="character && tab === CharacterMenuTab.Attributes"
        :character
        :game-text
        :is-level-upable="levelUpResult !== undefined"
        :is-liftable
        :traveler-bonus-lines
        :max-stamina
        :name="characterName"
        :stat-tables
        @level-up="levelUpCharacterAt"
        @lift="liftCharacter"
      />
      <CharacterMenuWeapons v-else-if="weaponPanel && tab === CharacterMenuTab.Weapons" :="weaponPanel" />
      <CharacterMenuArtifacts
        v-else-if="character && tab === CharacterMenuTab.Artifacts"
        :equipped="artifactsEquipped"
      />
      <CharacterMenuConstellation
        v-else-if="character && tab === CharacterMenuTab.Constellation"
        :activate-label="gameText[GameTextKey.Activate]"
        :activated="constellationsActivated"
        :is-activate-disabled
        @activate="activate()"
      />
      <CharacterMenuTalents
        v-else-if="talentPanel && tab === CharacterMenuTab.Talents"
        :="talentPanel"
        :upgrade-label="gameText[GameTextKey.TalentLevelUp]"
        @upgrade="(index) => upgradeTalentAt(index)"
      />
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
