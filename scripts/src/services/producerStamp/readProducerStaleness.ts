import type { ProducerStaleness } from "#src/models/producerStamp/ProducerStaleness";

import { producerStampSchema } from "#src/models/producerStamp/ProducerStamp";
import { PRODUCER_STAMP_NAME } from "#src/services/producerStamp/constants";
import { listProducerCommits } from "#src/services/producerStamp/listProducerCommits";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// The stamp an output carries, and the commits to its producer since, for a reader to warn of. An output with no stamp
// Predates the stamp, so its producer is unknown rather than current
export const readProducerStaleness = async (directory: string): Promise<ProducerStaleness> => {
  const path = join(directory, PRODUCER_STAMP_NAME);
  if (!existsSync(path)) return { commits: [], isApproximate: false };
  const stamp = producerStampSchema.parse(parseMachineJson(await readFile(path, "utf8")));
  return { ...listProducerCommits(stamp.commit, stamp.producerPaths), stamp };
};
