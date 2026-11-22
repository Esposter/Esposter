import type { ObjectCall } from "#src/workers/models/ObjectCall";
import type { ObjectReply } from "#src/workers/models/ObjectReply";
import type { Rpc } from "@cloudflare/workers-types";

// An object as the Worker that calls it reaches it. Each RPC is recorded, and resolves to the answer scripted for its method, if any.
// The stub exists only inside the Worker that owns the object, so this stands in for it
export const createObjectStub = <ObjectRpc>(
  objectId: string,
  objectCalls: ObjectCall[],
  objectReplies: Map<string, ObjectReply>,
): DurableObjectStub<ObjectRpc & Rpc.DurableObjectBranded> =>
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- a Workers stub carries a brand (`Rpc.DurableObjectBranded`) that no object literal satisfies, so the proxy's target is typed as the stub it stands in for
  new Proxy({} as DurableObjectStub<ObjectRpc & Rpc.DurableObjectBranded>, {
    get: (_target, method: string | symbol) => {
      // A stub is not a thenable, so `then` is unanswered and awaiting it resolves to the stub, and a symbol is not an RPC
      if (typeof method === "symbol" || method === "then") return undefined;

      return (...args: unknown[]) => {
        objectCalls.push({ args, method, objectId });
        return Promise.resolve(objectReplies.get(method)?.(args, objectId));
      };
    },
  });
