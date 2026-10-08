<script setup lang="ts">
import type { Character } from "#src/models/character/Character";
import type { GameText } from "genshin-text";

import CharacterAttributeList from "#src/components/Character/AttributeList/Index.vue";
import { CharacterMenuTabGameTextKeyMap } from "#src/services/character/CharacterMenuTabGameTextKeyMap";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { LOGIN_TRAVELER_GENDER } from "#src/services/login/constants";
import { CharacterMenu, CharacterMenuTab, CharacterMenuTabs } from "genshin-interface";
import { fillLinePlaceholders, GameTextKey } from "genshin-text";

interface Props {
  // The character the screen opens on, the one on the field
  activeCharacterId: number;
  // The player's characters, down the screen's left in the order given
  characters: Character[];
  // The game's words in the reader's language
  gameText: GameText;
  // The party's stamina, which the Attributes tab shows with every character's own attributes
  maxStamina: number;
}

const { activeCharacterId, characters, gameText, maxStamina } = defineProps<Props>();
const characterId = ref(activeCharacterId);
const tab = ref(CharacterMenuTab.Attributes);
const character = computed(() => characters.find(({ id }) => id === characterId.value));
// The Traveler's name is the game's own, and every other character's waits on the roster's names
const menuEntries = computed(() =>
  characters.map(({ id }) => ({
    id,
    name:
      id === TRAVELER_CHARACTER_ID
        ? fillLinePlaceholders(gameText[GameTextKey.Traveler], "", LOGIN_TRAVELER_GENDER)
        : "",
  })),
);
const tabLabels = computed(() =>
  Object.fromEntries(CharacterMenuTabs.map((menuTab) => [menuTab, gameText[CharacterMenuTabGameTextKeyMap[menuTab]]])),
);
</script>

<template>
  <!-- The character screen, the C key's: the player's characters, the one on the field chosen first, and the open
       Tab's panel for the chosen one. Only the Attributes tab draws a panel yet -->
  <CharacterMenu v-model:character-id="characterId" v-model:tab="tab" :characters="menuEntries" :tab-labels>
    <CharacterAttributeList
      v-if="character && tab === CharacterMenuTab.Attributes"
      :character
      :game-text
      :max-stamina
    />
  </CharacterMenu>
</template>
