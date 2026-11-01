<script setup lang="ts">
import type { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
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
import type { ReliquarySetData } from "#src/models/reliquary/ReliquarySetData";
import type { GameText } from "genshin-text";

import CharacterProfile from "#src/components/Character/Profile/Index.vue";
import CharacterScreenArtifacts from "#src/components/Character/Screen/Artifacts/Index.vue";
import CharacterScreenAttributes from "#src/components/Character/Screen/Attributes/Index.vue";
import CharacterScreenConstellation from "#src/components/Character/Screen/Constellation/Index.vue";
import CharacterScreenEnhance from "#src/components/Character/Screen/Enhance/Index.vue";
import CharacterScreenEquip from "#src/components/Character/Screen/Equip/Index.vue";
import CharacterScreenTalents from "#src/components/Character/Screen/Talents/Index.vue";
import CharacterScreenWeapons from "#src/components/Character/Screen/Weapons/Index.vue";
import { CharacterMenuTabGameTextKeyMap } from "#src/services/character/CharacterMenuTabGameTextKeyMap";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ElementNameGameTextKeyMap } from "#src/services/character/ElementNameGameTextKeyMap";
import { getCharacterElement } from "#src/services/character/getCharacterElement";
import { ElementMarkPathMap } from "#src/services/loading/ElementMarkPathMap";
import { LOGIN_TRAVELER_GENDER } from "#src/services/login/constants";
import {
  CharacterMenu,
  CharacterMenuTab,
  CharacterMenuTabs,
  CloseButton,
  CloseButtonMark,
  GameScreen,
} from "genshin-interface";
import { fillLinePlaceholders, GameLanguage, GameTextKey } from "genshin-text";

interface Props {
  // The character the screen opens on, the one on the field
  activeCharacterId: number;
  // The player's Adventure Rank, which an ascension's phase requires
  adventureRank: number;
  // The constellations each character's set holds, by its id, the ones its Activate button presses the next of
  characterIdConstellationsMap: ReadonlyMap<number, Constellation[]>;
  // The kit each character's combat talents are read from, the proud skill group each of them names
  characterTalentKits: CharacterTalentKit[];
  // The Companionship EXP each character has earned, by its id, from which its Friendship Level is read
  companionshipExpMap?: ReadonlyMap<number, number>;
  // The Friendship Level each character has reached, by its id, which its Attributes tab's Friendship row shows
  friendshipLevelMap?: ReadonlyMap<number, number>;
  // Where the host serves the game's published data, which the Profile tab reads its character's record from
  gameDataBaseUrl: string;
  // The game's words in the reader's language
  gameText: GameText;
  // The tab the screen opens on, Attributes as the game's C opens it
  initialTab: CharacterMenuTab;
  // Whether the device's main pointer is a finger, which the menu's keys are not drawn for
  isTouch: boolean;
  // The reader's game language, whose text the Profile tab shows
  language?: GameLanguage;
  // The game's material table by item id, which the materials a talent's next level takes are named from
  materialDataMap: ReadonlyMap<number, MaterialData>;
  // The party's stamina, which the Attributes tab shows with every character's own attributes
  maxStamina: number;
  // The names the stat tables cite, in the reader's language, by their text id
  nameText: Readonly<Record<string, string>>;
  // The game's artifact sets, by which a worn artifact's bag definition is rebuilt and the bag's pieces are named
  reliquarySets: readonly ReliquarySetData[];
  // The game's tables the characters' attributes are summed from
  statTables: StatTables;
  // The game's talent upgrades by proud skill group, which each combat talent's next level is read from
  talentUpgradeMap: TalentUpgradeMap;
  // The bonuses the Traveler holds from the elements it resonated with, once Welkin Moon's Homecoming is done
  travelerBonusLines: AttributeLine[];
  // The element the Traveler holds from the statue it resonated with last, none before any resonance
  travelerElement?: Element;
  // The player's UID, which the Attributes tab draws at the foot of the frame, none until the host gives it
  uid?: number;
}

// What the host lays behind the screen, the scene the open tab is shown over, and over it for the character it shows,
// Outside the game's own screen
defineSlots<{
  default?: (props: { characterId: number }) => unknown;
  scene?: (props: { element?: Element; tab: CharacterMenuTab }) => unknown;
}>();
const {
  activeCharacterId,
  adventureRank,
  characterIdConstellationsMap,
  characterTalentKits,
  companionshipExpMap = new Map<number, number>(),
  friendshipLevelMap = new Map<number, number>(),
  gameDataBaseUrl,
  gameText,
  initialTab,
  isTouch,
  language = GameLanguage.English,
  materialDataMap,
  maxStamina,
  nameText,
  reliquarySets,
  statTables,
  talentUpgradeMap,
  travelerBonusLines,
  travelerElement,
  uid,
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
// The slot each picker is open for: the Artifacts panel's Equip and Enhance buttons open it, and the picker's close clears it
const equipSlot = ref<ArtifactSlot>();
const enhanceSlot = ref<ArtifactSlot>();
// The bag's artifacts chosen as fodder and the ore counts chosen by item id, which the Artifacts panel's Enhance button
// Clears each time it opens the picker, so a choice never carries over from one enhancement to the next
const enhanceFodderIds = ref<number[]>([]);
const enhanceMaterialCounts = ref<Record<number, number>>({});
// The notice the artifact panel shows, the game's card for a refusal, kept across tabs until the next artifact action
const artifactNotice = ref("");
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
// The element of the chosen character, its own or, for the Traveler, the one it holds, none while it has none
const characterElement = computed(() =>
  getCharacterElement(characterId.value, statTables.characterDataMap, travelerElement),
);
// The element mark at the chosen character's name, its element's or, for the Traveler, its alignment's, empty while
// It has none
const elementMarkPath = computed(() => {
  const element = characterElement.value;
  return element === undefined ? "" : ElementMarkPathMap[element];
});
// The element's name in the reader's language, which the band sets before the chosen character's, empty if none
const elementName = computed(() => {
  const element = characterElement.value;
  return element === undefined ? "" : gameText[ElementNameGameTextKeyMap[element]];
});
const tabLabels = computed(() =>
  Object.fromEntries(CharacterMenuTabs.map((menuTab) => [menuTab, gameText[CharacterMenuTabGameTextKeyMap[menuTab]]])),
);
</script>

<template>
  <!-- The character screen, the C key's, a dialog over the world: the player's characters, the one on the field chosen
       First, the open tab's panel for the chosen one, the Profile's aside, and the way back -->
  <GameScreen class="character-screen" role="dialog" aria-modal="true" :aria-label="gameText[GameTextKey.Character]">
    <slot name="scene" :element="characterElement" :tab />
    <CharacterMenu
      v-model:character-id="characterId"
      v-model:tab="tab"
      :characters="menuEntries"
      :element-mark-path
      :element-name
      :is-touch
      :tab-labels
    >
      <CharacterScreenAttributes
        v-if="character && tab === CharacterMenuTab.Attributes"
        v-model:characters="characters"
        v-model:inventory="inventory"
        v-model:wallet="wallet"
        :adventure-rank
        :character
        :character-name="characterName"
        :friendship-level="friendshipLevelMap.get(character.id)"
        :game-text
        :material-data-map
        :max-stamina
        :name-text
        :stat-tables
        :traveler-bonus-lines
      />
      <CharacterScreenWeapons
        v-else-if="character && tab === CharacterMenuTab.Weapons"
        :character
        :game-text
        :name-text
        :stat-tables
      />
      <CharacterScreenArtifacts
        v-else-if="character && tab === CharacterMenuTab.Artifacts"
        v-model:artifact-notice="artifactNotice"
        v-model:characters="characters"
        v-model:enhance-fodder-ids="enhanceFodderIds"
        v-model:enhance-material-counts="enhanceMaterialCounts"
        v-model:enhance-slot="enhanceSlot"
        v-model:equip-slot="equipSlot"
        v-model:inventory="inventory"
        :character
        :game-text
        :name-text
        :reliquary-sets
        :stat-tables
      />
      <CharacterScreenConstellation
        v-else-if="character && tab === CharacterMenuTab.Constellation"
        v-model:characters="characters"
        :character
        :character-id-constellations-map
        :game-text
        :name-text
      />
      <CharacterScreenTalents
        v-else-if="character && tab === CharacterMenuTab.Talents"
        v-model:characters="characters"
        v-model:inventory="inventory"
        v-model:wallet="wallet"
        :character
        :character-talent-kits
        :game-text
        :material-data-map
        :name-text
        :talent-upgrade-map
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
    <CharacterScreenEquip
      v-if="equipSlot && character"
      v-model:characters="characters"
      v-model:inventory="inventory"
      :artifact-slot="equipSlot"
      :character
      :game-text
      :name-text
      :reliquary-sets
      @close="equipSlot = undefined"
    />
    <CharacterScreenEnhance
      v-if="enhanceSlot && character"
      v-model:characters="characters"
      v-model:enhance-fodder-ids="enhanceFodderIds"
      v-model:enhance-material-counts="enhanceMaterialCounts"
      v-model:inventory="inventory"
      v-model:wallet="wallet"
      :artifact-slot="enhanceSlot"
      :character
      :game-text
      :stat-tables
      @close="enhanceSlot = undefined"
    />
    <span class="grid" />
    <p v-if="tab === CharacterMenuTab.Attributes" class="training-guide cream-pill">
      {{ gameText[GameTextKey.TrainingGuide] }}
    </p>
    <p v-if="uid !== undefined && tab === CharacterMenuTab.Attributes" class="uid">
      {{ gameText[GameTextKey.Uid] }}: {{ uid }}
    </p>
    <CloseButton
      class="close"
      :label="gameText[GameTextKey.Back]"
      :mark="CloseButtonMark.Cross"
      @click="emit('close')"
    />
    <slot :character-id />
  </GameScreen>
</template>

<style scoped>
/* The still is 3440 by 1440, so its frame spans 2580 units at the height's unit, the width the unit fits in a window */
.character-screen {
  --game-design-width: 2580;
}

/* The foot's pieces, measured off the same frame: the grid's disc centred 148 units from the left and 1006 from the top,
   and the Training Guide pill from 200 units, 49 high. Their colours are provisional */
.grid {
  position: absolute;
  top: calc(var(--unit) * 978);
  left: calc(var(--unit) * 120);
  width: calc(var(--unit) * 56);
  height: calc(var(--unit) * 56);
  border-radius: 50%;
  background-color: #ece5d8;
  background-image:
    linear-gradient(#3b4255, #3b4255), linear-gradient(#3b4255, #3b4255), linear-gradient(#3b4255, #3b4255),
    linear-gradient(#3b4255, #3b4255);
  background-position:
    30% 30%,
    70% 30%,
    30% 70%,
    70% 70%;
  background-repeat: no-repeat;
  background-size: 20% 20%;
}

.training-guide {
  position: absolute;
  top: calc(var(--unit) * 983);
  left: calc(var(--unit) * 200);
  margin: 0;
  padding: 0 calc(var(--unit) * 26);
  line-height: calc(var(--unit) * 49);
}

/* The UID at the frame's foot, its right edge 150 units in from the frame's right and its line centred 1065 units down,
   measured off the reference frame (`references/character-attributes.png`, 0.75 units a pixel at 1440 high) */
.uid {
  position: absolute;
  top: calc(var(--unit) * 1052);
  right: calc(var(--unit) * 150);
  margin: 0;
  color: #ece5d8;
  font-size: calc(var(--unit) * 22);
  font-weight: 600;
  line-height: calc(var(--unit) * 26);
}

/* The way back's centre is 49 units from the top and 149 from the right, off the English client's character screen at
   21:9 (references/character-attributes-session.png). Its size and colours are provisional, as the quest screen's */
.close {
  top: calc(var(--unit) * 21);
  right: calc(var(--unit) * 121);
  width: calc(var(--unit) * 56);
  height: calc(var(--unit) * 56);
  background: #ece5d8;
  color: #3b4255;
  cursor: inherit;
}
</style>

<style scoped src="genshin-interface/styles/creamPill.css"></style>
