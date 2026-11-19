import type { useUserObject as useRealUserObject } from "#server/composables/realtime/useUserObject";
import type { ObjectInvocation } from "@esposter/db";

import { createObjectStub } from "@esposter/db";
import { describe, vi } from "vitest";

// Every RPC a person's object was sent, in order, with the person it was sent to. Stands in for the stub, which exists
// Only inside the Worker, so a test asserts what was called rather than what the object then did
export interface UserObjectCall {
  args: unknown[];
  method: string;
  userId: string;
}
const userObjectCallsHolder = vi.hoisted(() => ({ userObjectCalls: [] as UserObjectCall[] }));
export const userObjectCalls = userObjectCallsHolder.userObjectCalls;

// Answers one call the way the person's `invoke` does. A read answers with nothing held, since the double keeps no state of
// Its own, so its read and write sets are empty as well
const invokeUserObject = (userId: string, method: string, args: unknown[]): Promise<ObjectInvocation> => {
  userObjectCalls.push({ args, method, userId });
  return Promise.resolve({ readSet: [], result: method.startsWith("read") ? [] : undefined, writeSet: [] });
};

// The stub a person resolves to: `invoke` answers every RPC method, and `fetch` is the socket's upgrade, which the wrapper
// Forwards to the stub itself rather than through `invoke`
const createUserObjectStub = (userId: string) =>
  new Proxy({} as ReturnType<typeof useRealUserObject>, {
    get: (_target, member: string) => {
      if (member === "invoke") return (method: string, args: unknown[]) => invokeUserObject(userId, method, args);
      if (member === "fetch")
        return (...args: unknown[]) => {
          userObjectCalls.push({ args, method: member, userId });
          return Promise.resolve(undefined);
        };
      return undefined;
    },
  });

export const useUserObject = (userId: string): ReturnType<typeof useRealUserObject> =>
  createObjectStub(createUserObjectStub(userId));

describe.todo("useUserObject");
