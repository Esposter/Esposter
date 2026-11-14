import { describe, vi } from "vitest";

// Every RPC a room's object was sent, in order, with the room it was sent to. Stands in for the stub, which exists only
// inside the Worker, so a test asserts what was called rather than what the object then did
export interface RoomObjectCall {
  args: unknown[];
  method: string;
  roomId: string;
}
const roomObjectCallsHolder = vi.hoisted(() => ({ roomObjectCalls: [] as RoomObjectCall[] }));
export const roomObjectCalls = roomObjectCallsHolder.roomObjectCalls;

export const useRoomObject = (roomId: string) =>
  new Proxy(
    {},
    {
      get:
        (_target, method: string) =>
        (...args: unknown[]) => {
          roomObjectCalls.push({ args, method, roomId });
          return Promise.resolve();
        },
    },
  );

describe.todo("useRoomObject");
