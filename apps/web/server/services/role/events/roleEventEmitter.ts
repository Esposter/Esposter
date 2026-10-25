import type { RoleEvents } from "#server/models/role/events/RoleEvents";

import { EventEmitter } from "node:events";

export const roleEventEmitter = new EventEmitter<RoleEvents>();
