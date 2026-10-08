<script setup lang="ts">
import type { Character } from "#src/models/character/Character";
import type { StatTables } from "#src/models/character/StatTables";
import type { GameText } from "genshin-text";

import CharacterAttributeList from "#src/components/Character/AttributeList/Index.vue";
import { CharacterMenuTabGameTextKeyMap } from "#src/services/character/CharacterMenuTabGameTextKeyMap";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { LOGIN_TRAVELER_GENDER } from "#src/services/login/constants";
import { CharacterMenu, CharacterMenuTab, CharacterMenuTabs, GameScreen } from "genshin-interface";
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
  // The game's tables the characters' attributes are summed from
  statTables: StatTables;
}

const { activeCharacterId, characters, gameText, maxStamina, statTables } = defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
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
  <!-- The character screen, the C key's, a dialog over the world: the player's characters, the one on the field chosen
       First, the open tab's panel for the chosen one, of which only the Attributes tab's is drawn yet, and the way back -->
  <GameScreen role="dialog" aria-modal="true" :aria-label="gameText[GameTextKey.Character]">
    <CharacterMenu v-model:character-id="characterId" v-model:tab="tab" :characters="menuEntries" :tab-labels>
      <CharacterAttributeList
        v-if="character && tab === CharacterMenuTab.Attributes"
        :character
        :game-text
        :max-stamina
        :stat-tables
      />
    </CharacterMenu>
    <button class="close" :aria-label="gameText[GameTextKey.Back]" type="button" @click="emit('close')">×</button>
  </GameScreen>
</template>

<style scoped>
/* Provisional: the way back's place, size and colours, as the quest screen's, until the character screen's passes
   Measure them off a recording of the English client */
.close {
  position: absolute;
  top: calc(var(--unit) * 36);
  right: calc(var(--unit) * 48);
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
