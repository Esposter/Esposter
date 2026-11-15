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

// The answer a test scripts for an RPC that returns data, as a function of the call's arguments and person
export type UserObjectReply = (args: unknown[], userId: string) => unknown;
const userObjectRepliesHolder = vi.hoisted(() => ({ userObjectReplies: new Map<string, UserObjectReply>() }));
export const userObjectReplies = userObjectRepliesHolder.userObjectReplies;

// A person's object as the jobs Worker reaches it. Each RPC is recorded, and resolves to the answer scripted for its method, if any
export const getUserObject = (userId: string) =>
  new Proxy({} as DurableObjectStub<Rpc.DurableObjectBranded & UserObjectRpc>, {
    get:
      (_target, method: string) =>
      (...args: unknown[]) => {
        userObjectCalls.push({ args, method, userId });
        return Promise.resolve(userObjectReplies.get(method)?.(args, userId));
      },
  });

// A suite clears the calls and the answers it scripted, so each test starts from a person's object that has been asked nothing
export const clearUserObjectCalls = (): void => {
  userObjectCalls.length = 0;
  userObjectReplies.clear();
};

describe.todo("getUserObject");
