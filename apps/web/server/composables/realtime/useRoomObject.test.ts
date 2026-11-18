import type { useRoomObject as useRealRoomObject } from "#server/composables/realtime/useRoomObject";

import { describe, vi } from "vitest";

// Every RPC a room's object was sent, in order, with the room it was sent to. Stands in for the stub, which exists only
// Inside the Worker, so a test asserts what was called rather than what the object then did
export interface RoomObjectCall {
  args: unknown[];
  method: string;
  roomId: string;
}
const roomObjectCallsHolder = vi.hoisted(() => ({ roomObjectCalls: [] as RoomObjectCall[] }));
export const roomObjectCalls = roomObjectCallsHolder.roomObjectCalls;
// A method a test makes refuse, with the error its call rejects with. A method not named here resolves
export const roomObjectFailures = new Map<string, Error>();
// A method a test makes answer with a value, computed from the arguments of the call. A method not named here resolves
export const roomObjectReplies = new Map<string, (...args: unknown[]) => unknown>();

export const useRoomObject = (roomId: string): ReturnType<typeof useRealRoomObject> =>
  new Proxy({} as ReturnType<typeof useRealRoomObject>, {
    get:
      (_target, method: string) =>
      (...args: unknown[]) => {
        roomObjectCalls.push({ args, method, roomId });
        const failure = roomObjectFailures.get(method);
        if (failure) return Promise.reject(failure);
        return Promise.resolve(roomObjectReplies.get(method)?.(...args));
      },
  });

describe.todo("useRoomObject");
