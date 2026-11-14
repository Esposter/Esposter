import type { CutoverCheckpoint } from "#src/models/cutover/CutoverCheckpoint";
import type { R2Client } from "#src/models/cutover/R2Client";

import { cutoverCheckpointSchema } from "#src/models/cutover/CutoverCheckpoint";
import { getCheckpointKey } from "#src/services/cutover/checkpoint/getCheckpointKey";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";

// A unit's checkpoint, or undefined when none is kept yet. The stored JSON is validated by the schema, so a damaged one fails
// here rather than being read as progress
export const readCheckpoint = async (
  client: R2Client,
  archiveBucket: string,
  unit: string,
): Promise<CutoverCheckpoint | undefined> => {
  const text = await client.getText(archiveBucket, getCheckpointKey(unit));
  if (text === undefined) return undefined;
  return cutoverCheckpointSchema.parse(parseMachineJson(text));
};
