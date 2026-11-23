import type { useRoomObject as useRealRoomObject } from "#server/composables/realtime/useRoomObject";
import type { ObjectInvocation } from "@esposter/db";

import { createObjectStub } from "@esposter/db";
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

// Answers one call the way the room's `invoke` does. The double holds no state, so it reads and writes no topic: its
// Read And write sets are empty, and the room's own topics are checked by the realtime suites
const invokeRoomObject = (roomId: string, method: string, args: unknown[]): Promise<ObjectInvocation> => {
  roomObjectCalls.push({ args, method, roomId });
  const failure = roomObjectFailures.get(method);
  if (failure) return Promise.reject(failure);
  return Promise.resolve({ readSet: [], result: roomObjectReplies.get(method)?.(...args), writeSet: [] });
};

// The stub a room resolves to: `invoke` answers every RPC method, and `fetch` is the socket's upgrade, which the
// Wrapper Forwards to the stub itself rather than through `invoke`
const createRoomObjectStub = (roomId: string) =>
  new Proxy({} as ReturnType<typeof useRealRoomObject>, {
    get: (_target, member: string) => {
      if (member === "invoke") return (method: string, args: unknown[]) => invokeRoomObject(roomId, method, args);
      if (member === "fetch")
        return (...args: unknown[]) => {
          roomObjectCalls.push({ args, method: member, roomId });
          return Promise.resolve(undefined);
        };
      return undefined;
    },
  });

export const useRoomObject = (roomId: string): ReturnType<typeof useRealRoomObject> =>
  createObjectStub(createRoomObjectStub(roomId));

describe.todo("useRoomObject");
