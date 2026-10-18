import type { ArtifactRarityData } from "#src/models/artifact/ArtifactRarityData";

import { artifactRarityDataSchema } from "#src/models/artifact/ArtifactRarityData";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// The rarity data each star count of artifact shares, which the scripts' stat tables publish. Fetched by its key from the
// Hosted game data and checked against its shape as it arrives
export const readArtifactRarities = (gameDataBaseUrl: string): Promise<ArtifactRarityData[]> =>
  readGameData(gameDataBaseUrl, "stats/artifactRarities", z.array(artifactRarityDataSchema));
