import type { Rpc } from "@cloudflare/workers-types";
import type { RoomObjectRpc } from "@esposter/db-schema";

import { describe, vi } from "vitest";

// Every RPC a room's object was sent, in send order, with the room it was sent to. The object exists only inside the realtime
// Worker, so this stands in for its stub: a suite asserts what the job asked of the room, and what the job did with the answer
interface RoomObjectCall {
  args: unknown[];
  method: string;
  roomId: string;
}
const roomObjectCallsHolder = vi.hoisted(() => ({ roomObjectCalls: [] as RoomObjectCall[] }));
export const roomObjectCalls = roomObjectCallsHolder.roomObjectCalls;

// The answer a test scripts for an RPC that returns data, as a function of the call's arguments and room
type RoomObjectReply = (args: unknown[], roomId: string) => unknown;
const roomObjectRepliesHolder = vi.hoisted(() => ({ roomObjectReplies: new Map<string, RoomObjectReply>() }));
export const roomObjectReplies = roomObjectRepliesHolder.roomObjectReplies;

// A room's object as the jobs Worker reaches it. Each RPC is recorded, and resolves to the answer scripted for its method, if any
export const getRoomObject = (roomId: string) =>
  new Proxy({} as DurableObjectStub<RoomObjectRpc & Rpc.DurableObjectBranded>, {
    get:
      (_target, method: string) =>
      (...args: unknown[]) => {
        roomObjectCalls.push({ args, method, roomId });
        return Promise.resolve(roomObjectReplies.get(method)?.(args, roomId));
      },
  });

// A suite clears the calls and the answers it scripted, so each test starts from a room that has been asked nothing
export const clearRoomObjectCalls = (): void => {
  roomObjectCalls.length = 0;
  roomObjectReplies.clear();
};

describe.todo("getRoomObject");
