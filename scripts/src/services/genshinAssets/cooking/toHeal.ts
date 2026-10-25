import type { DishUse } from "genshin-world";

import { HEAL_BUFF_DESCRIPTION_REGEX, PERCENT_TOTAL } from "#src/services/genshinAssets/cooking/constants";

// The heal a description leads with, as the share of Max HP and the flat amount it writes. A description that is no heal
// Form is a drawback the dish gives instead, so it has none
export const toHeal = (description: string): DishUse["heal"] => {
  const match = HEAL_BUFF_DESCRIPTION_REGEX.exec(description);
  if (match?.groups === undefined) return undefined;
  return { flat: Number(match.groups.flat), healthShare: Number(match.groups.percent) / PERCENT_TOTAL };
};
