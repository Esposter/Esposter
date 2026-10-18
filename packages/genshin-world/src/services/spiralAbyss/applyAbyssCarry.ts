import type { PartyMember } from "#src/models/party/PartyMember";
import type { AbyssCarryMember } from "#src/models/spiralAbyss/AbyssCarryMember";

import { InvalidOperationError, Operation } from "@esposter/shared";

// The party's members with each carried character's health and energy put back as the carry took them, the rest left as they
// Stand, so a chamber starts from its clear's record rather than the party's state after it
export const applyAbyssCarry = (
  characterIdMemberMap: ReadonlyMap<number, PartyMember>,
  carry: readonly AbyssCarryMember[],
): Map<number, PartyMember> => {
  const nextCharacterIdMemberMap = new Map(characterIdMemberMap);
  for (const { characterId, energy, healthShare } of carry) {
    const member = characterIdMemberMap.get(characterId);
    if (!member) throw new InvalidOperationError(Operation.Update, applyAbyssCarry.name, `character ${characterId}`);
    nextCharacterIdMemberMap.set(characterId, { ...member, energy, healthShare });
  }
  return nextCharacterIdMemberMap;
};
