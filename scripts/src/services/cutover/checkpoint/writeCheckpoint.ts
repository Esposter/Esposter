import type { CutoverCheckpoint } from "#src/models/cutover/CutoverCheckpoint";
import type { R2Client } from "#src/models/cutover/R2Client";

import { getCheckpointKey } from "#src/services/cutover/checkpoint/getCheckpointKey";

// Replaces a unit's checkpoint with the one given. The caller merges what it keeps, so this only writes
export const writeCheckpoint = (
  client: R2Client,
  archiveBucket: string,
  unit: string,
  checkpoint: CutoverCheckpoint,
): Promise<void> => client.putText(archiveBucket, getCheckpointKey(unit), JSON.stringify(checkpoint));
