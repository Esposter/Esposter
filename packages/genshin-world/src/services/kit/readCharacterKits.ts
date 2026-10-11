import type { Kit } from "#src/models/kit/Kit";

import { CharacterIdCreateKitMap } from "#src/generated/characterKitMap/CharacterIdCreateKitMap";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { tagKitHits } from "#src/services/kit/tagKitHits";
import { createTravelerKit } from "#src/services/kit/travelerKit";

// The kits of the characters given, by character id, each built once from its own module and its talent multipliers,
// Both read on demand together as the character joins the party. A character with no module of its own fights with the
// Traveler's kit, built from the Traveler's multipliers, and each hit of a kit's actions deals the kind of attack its
// Action does
export const readCharacterKits = async (
  gameDataBaseUrl: string,
  characterIds: readonly number[],
): Promise<Map<number, Kit>> =>
  new Map(
    await Promise.all(
      characterIds.map(async (characterId) => {
        const loadCreateKit = CharacterIdCreateKitMap[characterId];
        const [createKit, talentMultiplierMap] = await Promise.all([
          loadCreateKit ? loadCreateKit() : createTravelerKit,
          readTalentMultipliers(gameDataBaseUrl, [loadCreateKit ? characterId : TRAVELER_CHARACTER_ID]),
        ]);
        return [characterId, tagKitHits(createKit(talentMultiplierMap))] as const;
      }),
    ),
  );
