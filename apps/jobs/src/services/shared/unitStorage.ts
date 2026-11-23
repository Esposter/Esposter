import type { RecordedUnit } from "#src/models/shared/RecordedUnit";

import { AsyncLocalStorage } from "node:async_hooks";

// The scope a unit of work runs in. A job's handle and its bucket bindings read it while the unit runs, so the
// Statements and Blob writes of the unit's own awaits are recorded into it and none of another unit's
export const unitStorage = new AsyncLocalStorage<RecordedUnit>();
