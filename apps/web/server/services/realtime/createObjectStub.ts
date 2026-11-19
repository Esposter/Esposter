import type { ColumnTopic } from "@esposter/db-schema";

import { recordObjectReads } from "#server/services/realtime/requestObjectReads";

// The members of a stub that are not its RPC methods: the object's HTTP entry, which a socket's upgrade is forwarded to, and
// `then`, by which a stub awaited as a value is asked whether it is a promise
const NON_RPC_MEMBERS = new Set(["fetch", "then"]);

// What an object's `invoke` answers an RPC call with: the method's result, the read set its reads watch, and the write set
// The object publishes. The stub unwraps the result and records the read set, and the object publishes its own write set
export interface ObjectInvocation {
  readSet: ColumnTopic[];
  result: unknown;
  writeSet: ColumnTopic[];
}

interface ObjectInvoker {
  invoke: (method: string, args: unknown[]) => Promise<ObjectInvocation>;
}

// The stub of a Durable Object, each RPC method of which runs through the object's `invoke`, so the read set it reports is
// Recorded into the request in scope. The stub keeps its own type, so a caller types the object's methods as before
export const createObjectStub = <T extends object>(stub: T): T =>
  new Proxy({} as T, {
    get: (_target, member) => {
      if (typeof member !== "string" || NON_RPC_MEMBERS.has(member)) {
        const value: unknown = Reflect.get(stub, member, stub);
        return typeof value === "function" ? value.bind(stub) : value;
      }
      return async (...args: unknown[]) => {
        // The forced conversion: the stub's invoke is generic over the method's name, which only the type system can give, so the
        // Name a call is made by at run time is passed as the string the object's invoke takes
        // eslint-disable-next-line no-restricted-syntax -- a dispatch by a name taken at run time, which the stub's generic invoke cannot type
        const { readSet, result } = await (stub as unknown as ObjectInvoker).invoke(member, args);
        recordObjectReads(readSet);
        return result;
      };
    },
  });
