import type { RecordedRows } from "#src/models/realtime/RecordedRows";
import type { BeforeRead } from "#src/services/realtime/getBeforeReads";

import { toRows } from "#src/services/realtime/toRows";

// The rows each read a write made before it ran resolved to, read from the batch's results from `start` on, each under
// The Table the read was of
export const getBeforeRows = (reads: BeforeRead[], results: unknown[], start: number): RecordedRows[] =>
  reads.map(({ table }, index) => ({ rows: toRows(results[start + index]), table }));
