import type { ArtifactMainAffixCurve } from "#src/models/artifact/ArtifactMainAffixCurve";

import artifactMainAffixCurves from "#src/generated/stats/artifactMainAffixCurves.json";
import { artifactMainAffixCurveSchema } from "#src/models/artifact/ArtifactMainAffixCurve";
import { z } from "zod";

// What each main affix gives at each rarity and enhancement level, as `pnpm -C scripts genshin:assets stats` writes it
// From the game's tables, checked against its schema as the world's code loads
export const ArtifactMainAffixCurves: readonly ArtifactMainAffixCurve[] = z
  .array(artifactMainAffixCurveSchema)
  .parse(artifactMainAffixCurves);
