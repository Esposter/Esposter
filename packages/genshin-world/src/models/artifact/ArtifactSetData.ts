import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";

import { artifactSetBonusSchema } from "#src/models/artifact/ArtifactSetBonus";
import { z } from "zod";

// An artifact set as the game's tables hold it, by the game's own id, and the bonus each count of its pieces gives
export interface ArtifactSetData {
  bonuses: ArtifactSetBonus[];
  id: number;
}

export const artifactSetDataSchema = z.object({
  bonuses: z.array(artifactSetBonusSchema).min(1),
  id: z.int().positive(),
}) satisfies z.ZodType<ArtifactSetData>;
