<script setup lang="ts">
import type { Character } from "#src/models/character/Character";
import type { Constellation } from "#src/models/character/Constellation";
import type { GameText } from "genshin-text";

import { activateConstellation } from "#src/services/character/activateConstellation";
import { getConstellationActivationRefusal } from "#src/services/character/getConstellationActivationRefusal";
import { replaceCharacterInRoster } from "#src/services/character/replaceCharacterInRoster";
import { CONSTELLATION_COUNT } from "#src/services/wish/constants";
import { CharacterMenuConstellation } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  // The character whose constellations the panel shows, the one its Activate button activates the next of
  character: Character;
  // The constellations each character's set holds, by its id, the ones its Activate button presses the next of
  characterIdConstellationsMap: ReadonlyMap<number, Constellation[]>;
  // The game's words in the reader's language
  gameText: GameText;
}

const characters = defineModel<Character[]>("characters", { required: true });
const { character, characterIdConstellationsMap, gameText } = defineProps<Props>();
// Which of the six constellations are activated, the first the character's count of them
const constellationsActivated = computed(() =>
  Array.from({ length: CONSTELLATION_COUNT }, (_value, index) => index < character.constellationCount),
);
// The set the Activate button presses the next of, and whether that is refused now, a character with no set refused too
const constellations = computed(() => characterIdConstellationsMap.get(character.id) ?? []);
const isActivateDisabled = computed(
  () => getConstellationActivationRefusal(character, constellations.value) !== undefined,
);
</script>

<template>
  <CharacterMenuConstellation
    :activate-label="gameText[GameTextKey.Activate]"
    :activated="constellationsActivated"
    :is-activate-disabled
    @activate="characters = replaceCharacterInRoster(characters, activateConstellation(character, constellations))"
  />
</template>
