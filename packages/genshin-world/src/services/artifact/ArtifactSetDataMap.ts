import type { ArtifactSetData } from "#src/models/artifact/ArtifactSetData";

import artifactSets from "#src/generated/stats/artifactSets.json";
import { artifactSetDataSchema } from "#src/models/artifact/ArtifactSetData";
import { z } from "zod";

// Every artifact set by its id, as `pnpm -C scripts genshin:assets stats` writes it from the game's tables, checked
// Against its schema as the world's code loads
export const ArtifactSetDataMap: ReadonlyMap<number, ArtifactSetData> = new Map(
  z
    .array(artifactSetDataSchema)
    .parse(artifactSets)
    .map((artifactSetData) => [artifactSetData.id, artifactSetData]),
);
