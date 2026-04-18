import { EventEmitter } from "node:events";

interface RoleEvents {
  updateRole: [];
}

const roleEventEmitters = new Map<string, EventEmitter<RoleEvents>>();
const updateRoleEventName = "updateRole";

export const getRoleEventEmitter = (roomId: string): EventEmitter<RoleEvents> => {
  const existing = roleEventEmitters.get(roomId);
  if (existing) return existing;
  const emitter = new EventEmitter<RoleEvents>();
  emitter.on("removeListener", (event) => {
    if (event === updateRoleEventName && emitter.listenerCount(updateRoleEventName) === 0)
      roleEventEmitters.delete(roomId);
  });
  roleEventEmitters.set(roomId, emitter);
  return emitter;
};
