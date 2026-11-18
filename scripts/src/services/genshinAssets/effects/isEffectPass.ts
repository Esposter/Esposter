import type { SerializedShaderState } from "#src/models/genshinAssets/materials/SerializedShaderState";

import { DEPTH_WRITE, EFFECT_BLENDS } from "#src/services/genshinAssets/effects/constants";

// A pass draws as an effect when its blend is one an effect draws with and it writes no depth
export const isEffectPass = ({ blend, depth }: SerializedShaderState): boolean =>
  depth.zWrite.value === DEPTH_WRITE.Off &&
  EFFECT_BLENDS.some(
    ({ destination, source }) => source === blend.source.value && destination === blend.destination.value,
  );
