import { EventEmitter } from "node:events";

interface RoleEvents {
  updateRole: [{ roomId: string }];
}

export const roleEventEmitter = new EventEmitter<RoleEvents>();
