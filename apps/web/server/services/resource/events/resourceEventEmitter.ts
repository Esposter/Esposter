import type { ResourceEvents } from "#server/models/resource/events/ResourceEvents";

import { EventEmitter } from "node:events";

export const resourceEventEmitter = new EventEmitter<ResourceEvents>();
