import type { StorageEvents } from "#server/models/storage/events/StorageEvents";

import { EventEmitter } from "node:events";

export const storageEventEmitter = new EventEmitter<StorageEvents>();
