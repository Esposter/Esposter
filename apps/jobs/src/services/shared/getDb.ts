import type { Database } from "@esposter/db-schema";

import { getCoreDatabase } from "#src/services/shared/getCoreDatabase";
import { unitStorage } from "#src/services/shared/unitStorage";

// The handle a job's statements run through. Inside a unit of work it is the unit's recorded handle, so the unit's
// Writes are named when it settles; outside one it is the D1 handle itself
export const getDb = (): Database => unitStorage.getStore()?.database ?? getCoreDatabase();
