import type { useUserObject as useRealUserObject } from "#server/composables/realtime/useUserObject";

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

export const useUserObject = (userId: string): ReturnType<typeof useRealUserObject> =>
  new Proxy({} as ReturnType<typeof useRealUserObject>, {
    get:
      (_target, method: string) =>
      (...args: unknown[]) => {
        userObjectCalls.push({ args, method, userId });
        return Promise.resolve();
      },
  });

describe.todo("useUserObject");
