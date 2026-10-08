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
  // The player's characters, across the screen's top in the order given
  characters: Character[];
  // The game's words in the reader's language
  gameText: GameText;
  // The names the stat tables cite, in the reader's language, by their text id
  nameText: Readonly<Record<string, string>>;
  // The party's stamina, which the Attributes tab shows with every character's own attributes
  maxStamina: number;
  // The game's tables the characters' attributes are summed from
  statTables: StatTables;
}

const { activeCharacterId, characters, gameText, maxStamina, nameText, statTables } = defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
const characterId = ref(activeCharacterId);
const tab = ref(CharacterMenuTab.Attributes);
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
        :name="characterName"
        :stat-tables
      />
    </CharacterMenu>
    <span class="grid" />
    <p class="training-guide">{{ gameText[GameTextKey.TrainingGuide] }}</p>
    <button class="close" :aria-label="gameText[GameTextKey.Back]" type="button" @click="emit('close')">×</button>
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
