import type { RecordedBlobs } from "@esposter/db";

import { AsyncLocalStorage } from "node:async_hooks";

// The request scope of its blob reads and writes. A request that records them runs in it, and each bucket binding
// Records into the scope its call runs in, so a read or a write made anywhere in the request is named with the
// Request's
export const requestBlobsStorage = new AsyncLocalStorage<RecordedBlobs>();
