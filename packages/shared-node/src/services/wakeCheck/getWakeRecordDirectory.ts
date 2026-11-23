import { join } from "node:path";

// Where a run's records are kept, under the root `.vitest` the sharded runs keep out of git. The run clears it before
// Its First file starts, and the merged shards' gate reads the same folder from the root the run was started at
export const getWakeRecordDirectory = (root: string): string => join(root, ".vitest", "wake-check");
