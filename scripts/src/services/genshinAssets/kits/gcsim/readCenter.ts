import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";

import { GcsimHitboxCenter } from "#src/models/genshinAssets/kits/gcsim/GcsimHitboxCenter";
import { PLACE_REGEX } from "#src/services/genshinAssets/kits/gcsim/constants";
import { readArgumentText } from "#src/services/genshinAssets/kits/gcsim/readArgumentText";
import { readGetterCenter } from "#src/services/genshinAssets/kits/gcsim/readGetterCenter";

// The centre a source or target argument names: its getter, else for a place its name is bound to by a getter, else
// The place itself, the code computes it somewhere a getter does not give. Any other call names none
export const readCenter = (
  tokens: readonly GoToken[],
  start: number,
  resolveAssignment: (name: string) => number | undefined,
): GcsimHitboxCenter | undefined => {
  const text = readArgumentText(tokens, start);
  if (!PLACE_REGEX.test(text)) return readGetterCenter(text);
  const valueStart = resolveAssignment(text);
  const boundCenter = valueStart === undefined ? undefined : readGetterCenter(readArgumentText(tokens, valueStart));
  return boundCenter ?? GcsimHitboxCenter.Position;
};
