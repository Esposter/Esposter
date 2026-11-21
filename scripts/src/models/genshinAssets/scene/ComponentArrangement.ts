import type { ArrangementFamily } from "#src/models/genshinAssets/scene/ArrangementFamily";
import type { ArrangementRatio } from "#src/models/genshinAssets/scene/ArrangementRatio";
import type { AssetPlacement } from "#src/models/genshinAssets/shared/AssetPlacement";
import type { DecodedClip } from "#src/models/genshinAssets/shared/DecodedClip";

export interface ComponentArrangement {
  explainedOffsets: Record<
    string,
    (placements: readonly AssetPlacement[], clips: readonly DecodedClip[]) => [number, number]
  >;
  families: ArrangementFamily[];
  ratios: Record<string, ArrangementRatio>;
}
