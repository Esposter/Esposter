import type { ReputationCity } from "#src/models/reputation/ReputationCity";

import { reputationCitySchema } from "#src/models/reputation/ReputationCity";

// Mondstadt's Reputation, the slice `pnpm -C scripts genshin:assets reputation` writes, imported on demand as a chunk of its
// Own and checked against its shape as it arrives
export const readMondstadtReputation = async (): Promise<ReputationCity> => {
  const { default: mondstadtReputation } = await import("#src/generated/reputation/mondstadt.json");
  return reputationCitySchema.parse(mondstadtReputation);
};
