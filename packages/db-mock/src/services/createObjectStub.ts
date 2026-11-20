import type { Rpc } from "@cloudflare/workers-types";
import type { ObjectCall } from "#src/models/ObjectCall";
import type { ObjectReply } from "#src/models/ObjectReply";

// An object as the Worker that calls it reaches it. Each RPC is recorded, and resolves to the answer scripted for its method, if any.
// The stub exists only inside the Worker that owns the object, so this stands in for it
export const createObjectStub = <ObjectRpc>(
  objectId: string,
  objectCalls: ObjectCall[],
  objectReplies: Map<string, ObjectReply>,
): DurableObjectStub<ObjectRpc & Rpc.DurableObjectBranded> =>
  new Proxy({} as DurableObjectStub<ObjectRpc & Rpc.DurableObjectBranded>, {
    get:
      (_target, method: string) =>
      (...args: unknown[]) => {
        objectCalls.push({ args, method, objectId });
        return Promise.resolve(objectReplies.get(method)?.(args, objectId));
      },
  });
