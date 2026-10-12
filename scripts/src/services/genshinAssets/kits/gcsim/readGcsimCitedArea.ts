import type { AttackArea } from "genshin-world";

import { GcsimHitboxShape } from "#src/models/genshinAssets/kits/gcsim/GcsimHitboxShape";
import { readGoHitbox } from "#src/services/genshinAssets/kits/gcsim/readGoHitbox";
import { tokenizeGo } from "#src/services/genshinAssets/kits/gcsim/tokenizeGo";

// Every kit area is built at this height, a shared rule of the builders, as a gcsim hitbox carries none
const AREA_HEIGHT = 2;

// The area a circle constructor on a line gives: its radius, its fan angle in radians or a whole circle's 2π, and the
// Shared height. The first `combat` hitbox constructor the line calls is the one read, and a box or no constructor has no
// Area in the kit's shape, so it gives none
export const readGcsimCitedArea = (line: string, file: string): AttackArea | undefined => {
  const tokens = tokenizeGo(line);
  for (let position = 0; position < tokens.length; position++) {
    const hitbox = readGoHitbox(tokens, position, () => undefined, file);
    if (hitbox === undefined) continue;
    if (hitbox.shape !== GcsimHitboxShape.Circle || hitbox.radius === undefined) return undefined;
    return {
      angle: hitbox.fanAngle === undefined ? 2 * Math.PI : (hitbox.fanAngle * Math.PI) / 180,
      height: AREA_HEIGHT,
      radius: hitbox.radius,
    };
  }
  return undefined;
};
