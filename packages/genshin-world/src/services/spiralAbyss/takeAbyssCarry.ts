import type { PartyMember } from "#src/models/party/PartyMember";
import type { AbyssCarryMember } from "#src/models/spiralAbyss/AbyssCarryMember";

// The health and energy of the party's characters as the party holds them when a chamber completes, copied out so that
// What the party does after the clear, its healing included, does not change what the next chamber starts from
export const takeAbyssCarry = (characterIdMemberMap: ReadonlyMap<number, PartyMember>): AbyssCarryMember[] =>
  Array.from(characterIdMemberMap, ([characterId, member]) => ({
    characterId,
    energy: member.energy,
    healthShare: member.healthShare,
  }));
