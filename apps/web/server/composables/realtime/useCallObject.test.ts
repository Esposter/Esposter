import type { useCallObject as useRealCallObject } from "#server/composables/realtime/useCallObject";

import { describe, vi } from "vitest";

// Every RPC a call's object was sent, in order, with the call session it was sent to. Stands in for the stub, which
// Exists only inside the Worker, so a test asserts what was called rather than what the object then did
export interface CallObjectCall {
  args: unknown[];
  callSessionId: string;
  method: string;
}
const callObjectCallsHolder = vi.hoisted(() => ({ callObjectCalls: [] as CallObjectCall[] }));
export const callObjectCalls = callObjectCallsHolder.callObjectCalls;

export const useCallObject = (callSessionId: string): ReturnType<typeof useRealCallObject> =>
  new Proxy({} as ReturnType<typeof useRealCallObject>, {
    get:
      (_target, method: string) =>
      (...args: unknown[]) => {
        callObjectCalls.push({ args, callSessionId, method });
        return Promise.resolve();
      },
  });

describe.todo("useCallObject");
