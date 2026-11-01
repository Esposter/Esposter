import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";
import type { AttackArea } from "genshin-world";

import { readGoHitbox } from "#src/services/genshinAssets/kits/gcsim/readGoHitbox";
import { toGcsimArea } from "#src/services/genshinAssets/kits/gcsim/toGcsimArea";
import { tokenizeGo } from "#src/services/genshinAssets/kits/gcsim/tokenizeGo";

// The area the first `combat` hitbox constructor a line calls gives, priced as the mechanical reader prices the same
// Hitbox, at the targeting area its action's reach is measured from, with the sizes the constructor reads, which the
// Offset it moves by is not part of. A constructor no kit area gives has none. The cause its pricing gives is not kept, as
// A cited value carries its citation as its provenance. The names a size or offset is written with resolve through
// `resolveName`, as the mechanical path resolves them, so a size a package constant names reads as that number
export const readGcsimCitedArea = (
  line: string,
  file: string,
  targetingArea: AttackArea,
  resolveName: (name: string) => GoValue | undefined,
): undefined | { area: AttackArea; sizes: number[] } => {
  const tokens = tokenizeGo(line);
  for (let position = 0; position < tokens.length; position++) {
    const hitbox = readGoHitbox(tokens, position, resolveName, file, () => undefined);
    if (hitbox !== undefined) {
      const area = toGcsimArea(hitbox, targetingArea)?.area;
      return area === undefined
        ? undefined
        : { area, sizes: hitbox.radius === undefined ? (hitbox.box ?? []) : [hitbox.radius] };
    }
  }
  return undefined;
};
