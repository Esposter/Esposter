import type { ProducerStaleness } from "#src/models/producerStamp/ProducerStaleness";

import { listProducerCommits } from "#src/services/producerStamp/listProducerCommits";
import { readProvenance } from "#src/services/provenance/readProvenance";

// The stamp an output carries, and the commits to its producer since, for a reader to warn of. An output with no stamp
// Predates the stamp, so its producer is unknown rather than current
export const readProducerStaleness = async (directory: string, cwd?: string): Promise<ProducerStaleness> => {
  const provenance = await readProvenance(directory);
  if (!provenance) return { commits: [], isApproximate: false };
  const { commit, producerPaths } = provenance.producer;
  return { ...listProducerCommits(commit, producerPaths, cwd), producer: provenance.producer };
};
