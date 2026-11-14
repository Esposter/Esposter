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

export const useRoomObject = (roomId: string): ReturnType<typeof useRealRoomObject> =>
  new Proxy({} as ReturnType<typeof useRealRoomObject>, {
    get:
      (_target, method: string) =>
      (...args: unknown[]) => {
        roomObjectCalls.push({ args, method, roomId });
        return Promise.resolve();
      },
  });

describe.todo("useRoomObject");
