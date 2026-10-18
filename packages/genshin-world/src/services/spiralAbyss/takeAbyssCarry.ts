import type { PartyMember } from "#src/models/party/PartyMember";
import type { AbyssCarryMember } from "#src/models/spiralAbyss/AbyssCarryMember";

import { InvalidOperationError, Operation } from "@esposter/shared";

// The health and energy of the given characters as the party holds them when a chamber completes, copied out so that what the
// Party does after the clear, its healing included, does not change what the next chamber starts from. A character the party
// Holds no state for is refused rather than carried as nothing
export const takeAbyssCarry = (
  characterIds: readonly number[],
  characterIdMemberMap: ReadonlyMap<number, PartyMember>,
): AbyssCarryMember[] =>
  characterIds.map((characterId) => {
    const member = characterIdMemberMap.get(characterId);
    if (!member) throw new InvalidOperationError(Operation.Read, takeAbyssCarry.name, `character ${characterId}`);
    return { characterId, energy: member.energy, healthShare: member.healthShare };
  });
