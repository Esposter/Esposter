import type { ForgeTalent } from "#src/models/forging/ForgeTalent";

import { AvatarIdForgeTalentMap } from "#src/services/forging/constants";

// The forging talents the party's characters give the blacksmith, one for each of them that has one
export const computeForgeTalents = (partyCharacterIds: number[]): ForgeTalent[] =>
  partyCharacterIds.flatMap((characterId) => {
    const talent = AvatarIdForgeTalentMap[characterId];
    return talent ? [talent] : [];
  });
