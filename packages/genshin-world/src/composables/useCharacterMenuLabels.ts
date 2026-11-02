import type { Character } from "#src/models/character/Character";
import type { StatTables } from "#src/models/character/StatTables";
import type { Element } from "#src/models/Element";
import type { GameText } from "genshin-text";
import type { MaybeRefOrGetter } from "vue";

import { CharacterMenuTabGameTextKeyMap } from "#src/services/character/CharacterMenuTabGameTextKeyMap";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ElementNameGameTextKeyMap } from "#src/services/character/ElementNameGameTextKeyMap";
import { getCharacterElement } from "#src/services/character/getCharacterElement";
import { ElementMarkPathMap } from "#src/services/loading/ElementMarkPathMap";
import { LOGIN_TRAVELER_GENDER } from "#src/services/login/constants";
import { CharacterMenuTabs } from "genshin-interface";
import { fillLinePlaceholders, GameTextKey } from "genshin-text";
import { computed, toValue } from "vue";

// The labels the character menu and its panels are drawn with: each character's name, the chosen character's name,
// Its element mark and element name, and the tabs' labels, all read from the characters and the game's text given
export const useCharacterMenuLabels = ({
  characterId,
  characters,
  gameText,
  nameText,
  statTables,
  travelerElement,
}: {
  characterId: MaybeRefOrGetter<number>;
  characters: MaybeRefOrGetter<Character[]>;
  gameText: MaybeRefOrGetter<GameText>;
  nameText: MaybeRefOrGetter<Readonly<Record<string, string>>>;
  statTables: MaybeRefOrGetter<StatTables>;
  travelerElement: MaybeRefOrGetter<Element | undefined>;
}) => {
  // The Traveler's name is the game's own, and every other character's is the name its table cites
  const menuEntries = computed(() => {
    const gameTextValue = toValue(gameText);
    const nameTextValue = toValue(nameText);
    const statTablesValue = toValue(statTables);
    return toValue(characters).map(({ id }) => ({
      id,
      name:
        id === TRAVELER_CHARACTER_ID
          ? fillLinePlaceholders(gameTextValue[GameTextKey.Traveler], "", LOGIN_TRAVELER_GENDER)
          : nameTextValue[statTablesValue.characterDataMap.get(id)?.nameTextId ?? ""] || "",
    }));
  });
  const characterName = computed(() => menuEntries.value.find(({ id }) => id === toValue(characterId))?.name ?? "");
  // The element of the chosen character, its own or, for the Traveler, the one it holds, none while it has none
  const characterElement = computed(() =>
    getCharacterElement(toValue(characterId), toValue(statTables).characterDataMap, toValue(travelerElement)),
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
    return element === undefined ? "" : toValue(gameText)[ElementNameGameTextKeyMap[element]];
  });
  const tabLabels = computed(() => {
    const gameTextValue = toValue(gameText);
    return Object.fromEntries(
      CharacterMenuTabs.map((menuTab) => [menuTab, gameTextValue[CharacterMenuTabGameTextKeyMap[menuTab]]]),
    );
  });
  return { characterElement, characterName, elementMarkPath, elementName, menuEntries, tabLabels };
};
