import type { ColumnTopic } from "@esposter/db-schema";

import { AsyncLocalStorage } from "node:async_hooks";

// The request scope of the read sets its object calls reported. A request that answers a query runs in it, and each
// Call of an Object records the read set its object reported into the scope its call runs in, so the query's topics
// Name what it read there
export const requestObjectReadsStorage = new AsyncLocalStorage<ColumnTopic[]>();
