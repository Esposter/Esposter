import type { StreamTable } from "@esposter/db-schema";

import { ARCHIVE_CHECKPOINT_PREFIX } from "#src/services/cutover/constants";

// The archive object holding one flushed segment of a table's id map, numbered in the order they were flushed
export const getIdMapSegmentKey = (azureTable: StreamTable, index: number): string =>
  `${ARCHIVE_CHECKPOINT_PREFIX}/id-map/${azureTable}/${index}.json`;
