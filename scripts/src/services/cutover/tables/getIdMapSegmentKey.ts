import { ARCHIVE_CHECKPOINT_PREFIX } from "#src/services/cutover/constants";

// The archive object holding one flushed segment of a scope's id map, numbered in the order they were flushed
export const getIdMapSegmentKey = (scope: string, index: number): string =>
  `${ARCHIVE_CHECKPOINT_PREFIX}/id-map/${scope}/${index}.json`;
