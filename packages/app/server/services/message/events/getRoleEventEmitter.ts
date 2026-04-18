import { EventEmitter } from "node:events";

interface RoleEvents {
  updateRole: [];
}

const roleEventEmitters = new Map<string, EventEmitter<RoleEvents>>();

export const getRoleEventEmitter = (roomId: string) => {
  const existingEmitter = roleEventEmitters.get(roomId);
  if (existingEmitter) return existingEmitter;
  const emitter = new EventEmitter<RoleEvents>();
  roleEventEmitters.set(roomId, emitter);
  return emitter;
};
