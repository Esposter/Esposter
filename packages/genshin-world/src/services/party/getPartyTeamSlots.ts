import type { Character } from "#src/models/character/Character";
import type { CharacterData } from "#src/models/character/CharacterData";
import type { Element } from "#src/models/Element";
import type { PartyTeam } from "#src/models/party/PartyTeam";
import type { PartyTeamSlot } from "#src/models/party/PartyTeamSlot";

import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { PARTY_TEAM_SIZE } from "#src/services/party/constants";

// A team's four slots in slot order, each member's name in the reader's language, the Traveler's being the one the player
// Chose while there is one, and its level and element. A name the text has not loaded is blank until it arrives
export const getPartyTeamSlots = (
  { characterIds }: PartyTeam,
  characters: readonly Pick<Character, "id" | "level">[],
  characterDataMap: ReadonlyMap<number, Pick<CharacterData, "element" | "nameTextId">>,
  nameTextMap: Readonly<Record<string, string>>,
  travelerName: string,
): PartyTeamSlot[] =>
  Array.from({ length: PARTY_TEAM_SIZE }, (_value, index): PartyTeamSlot => {
    const characterId = characterIds[index];
    const character = characters.find(({ id }) => id === characterId);
    if (characterId === undefined || !character) return { level: 0, name: "" };
    const characterData = characterDataMap.get(characterId);
    const element: Element | undefined = characterData?.element;
    const name =
      characterId === TRAVELER_CHARACTER_ID && travelerName
        ? travelerName
        : nameTextMap[characterData?.nameTextId ?? ""] || "";
    return { element, level: character.level, name };
  });
