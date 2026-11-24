import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";
import type { AttackArea } from "genshin-world";

import { readGoHitbox } from "#src/services/genshinAssets/kits/gcsim/readGoHitbox";
import { toGcsimArea } from "#src/services/genshinAssets/kits/gcsim/toGcsimArea";
import { tokenizeGo } from "#src/services/genshinAssets/kits/gcsim/tokenizeGo";

// The area the first `combat` hitbox constructor a line calls gives, priced as the mechanical reader prices it.
// It is priced at the targeting area its action's reach is measured from.
// Its sizes are the ones the constructor reads, not the offset it moves by.
// A constructor no kit area gives has none.
// The cause its pricing gives is not kept, as a cited value carries its citation as its provenance.
// The names a size or offset is written with resolve through `resolveName`, as the mechanical path resolves them.
// So a size a package constant names reads as that number.
export const readGcsimCitedArea = (
  line: string,
  file: string,
  targetingArea: AttackArea,
  resolveName: (name: string) => GoValue | undefined,
): { area: AttackArea; sizes: number[] } | undefined => {
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
