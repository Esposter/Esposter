import type { Rpc } from "@cloudflare/workers-types";
import type { UserObjectRpc } from "@esposter/db-schema";

import { describe, vi } from "vitest";

// Every RPC a person's object was sent, in order, with the person it was sent to.
// It stands in for the stub, which exists only inside the Worker.
// So a test asserts what was called rather than what the object then did.
export interface UserObjectCall {
  args: unknown[];
  method: string;
  userId: string;
}
const userObjectCallsHolder = vi.hoisted(() => ({ userObjectCalls: [] as UserObjectCall[] }));
export const userObjectCalls = userObjectCallsHolder.userObjectCalls;

export const getUserObject = (userId: string) =>
  new Proxy({} as DurableObjectStub<Rpc.DurableObjectBranded & UserObjectRpc>, {
    get:
      (_target, method: string) =>
      (...args: unknown[]) => {
        userObjectCalls.push({ args, method, userId });
        return Promise.resolve();
      },
  });

describe.todo("getUserObject");
