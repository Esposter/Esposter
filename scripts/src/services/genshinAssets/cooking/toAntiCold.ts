import type { BuffRow } from "#src/models/genshinAssets/cooking/BuffRow";
import type { DishUse } from "genshin-world";

import { ANTI_COLD_DESCRIPTION_REGEX } from "#src/services/genshinAssets/cooking/constants";

// The ratio an anti-cold buff's description writes, which holds the fill down by it for the seconds the buff lasts. A
// Description that writes none is a drawback the dish gives instead, so it has none
export const toAntiCold = (buff: BuffRow): DishUse["antiCold"] => {
  const match = ANTI_COLD_DESCRIPTION_REGEX.exec(buff.desc);
  if (match?.groups === undefined) return undefined;
  return { ratio: Number(match.groups.ratio), seconds: buff.time };
};
