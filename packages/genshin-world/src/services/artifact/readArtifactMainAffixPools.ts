import type { ArtifactMainAffixPool } from "#src/models/artifact/ArtifactMainAffixPool";

import { artifactMainAffixPoolSchema } from "#src/models/artifact/ArtifactMainAffixPool";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// The attributes each artifact slot's main affix may be, which the scripts' stat tables publish. Fetched by its key from the
// Hosted game data and checked against its shape as it arrives
export const readArtifactMainAffixPools = (gameDataBaseUrl: string): Promise<ArtifactMainAffixPool[]> =>
  readGameData(gameDataBaseUrl, "stats/artifactMainAffixPools", z.array(artifactMainAffixPoolSchema));
