import { EventEmitter } from "node:events";

interface RoleEvents {
  updateRole: [];
}

const roleEventEmitters = new Map<string, EventEmitter<RoleEvents>>();

export const getRoleEventEmitter = (roomId: string, signal?: AbortSignal): EventEmitter<RoleEvents> => {
  const existingEmitter = roleEventEmitters.get(roomId);
  const emitter = existingEmitter ?? new EventEmitter<RoleEvents>();
  if (!existingEmitter) roleEventEmitters.set(roomId, emitter);
  signal?.addEventListener(
    "abort",
    () => {
      releaseRoleEventEmitter(roomId);
    },
    { once: true },
  );
  return emitter;
};

export const releaseRoleEventEmitter = (roomId: string): void => {
  const emitter = roleEventEmitters.get(roomId);
  if (emitter?.eventNames().length !== 0) return;
  roleEventEmitters.delete(roomId);
};
