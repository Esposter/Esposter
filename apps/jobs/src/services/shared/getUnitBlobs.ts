import type { RecordedBlobs } from "@esposter/db";

import { unitStorage } from "#src/services/shared/unitStorage";

// The blobs a unit of work reads and writes, which a bucket binding records into while the unit runs, and nothing
// Outside one
export const getUnitBlobs = (): RecordedBlobs | undefined => unitStorage.getStore()?.blobs;
