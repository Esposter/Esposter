import type { AttackArea } from "genshin-world";

import { readGoHitbox } from "#src/services/genshinAssets/kits/gcsim/readGoHitbox";
import { toGcsimArea } from "#src/services/genshinAssets/kits/gcsim/toGcsimArea";
import { tokenizeGo } from "#src/services/genshinAssets/kits/gcsim/tokenizeGo";

// The area the first `combat` hitbox constructor a line calls gives, priced as the mechanical reader prices the same
// Hitbox, at the targeting area its action's reach is measured from, with the sizes the constructor reads, which the
// Offset it moves by is not part of. A constructor no kit area gives has none. The cause its pricing gives is not kept, as
// A cited value carries its citation as its provenance
export const readGcsimCitedArea = (
  line: string,
  file: string,
  targetingArea: AttackArea,
): undefined | { area: AttackArea; sizes: number[] } => {
  const tokens = tokenizeGo(line);
  for (let position = 0; position < tokens.length; position++) {
    const hitbox = readGoHitbox(
      tokens,
      position,
      () => undefined,
      file,
      () => undefined,
    );
    if (hitbox !== undefined) {
      const area = toGcsimArea(hitbox, targetingArea)?.area;
      return area === undefined
        ? undefined
        : { area, sizes: hitbox.radius === undefined ? (hitbox.box ?? []) : [hitbox.radius] };
    }
  }
  return undefined;
};
