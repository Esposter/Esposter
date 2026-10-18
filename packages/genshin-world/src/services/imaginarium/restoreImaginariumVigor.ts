import type { ImaginariumMember } from "#src/models/imaginarium/ImaginariumMember";

import { IMAGINARIUM_VIGOR } from "#src/services/imaginarium/constants";

// The member with its Vigor restored to full: the effect of the Mystery Cache option that fully restores one character whose
// Vigor is not full
export const restoreImaginariumVigor = (member: ImaginariumMember): ImaginariumMember => ({
  ...member,
  vigor: IMAGINARIUM_VIGOR,
});
