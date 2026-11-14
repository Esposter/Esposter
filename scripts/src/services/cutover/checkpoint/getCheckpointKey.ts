import { ARCHIVE_CHECKPOINT_PREFIX } from "#src/services/cutover/constants";

// The object a unit's checkpoint is kept in, under the checkpoint prefix of the archive bucket
export const getCheckpointKey = (unit: string): string => `${ARCHIVE_CHECKPOINT_PREFIX}/${unit}.json`;
