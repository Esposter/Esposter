import type { ObjectInvoker } from "#src/models/realtime/ObjectInvoker";
import type { ColumnTopic } from "@esposter/db-schema";

// The members of a stub that are not its RPC methods: the object's HTTP entry, which a socket's upgrade is forwarded to, and
// `then`, by which a stub awaited as a value is asked whether it is a promise
const NON_RPC_MEMBERS = new Set(["fetch", "then"]);

// The stub of a Durable Object, each RPC method of which runs through the object's `invoke`. The object publishes the write
// Set itself, so the stub only unwraps the result, and hands the read set to `onReadSet` where a caller watches its reads.
// The stub keeps its own type, so a caller types the object's methods as before
export const createObjectStub = <T extends object>(stub: T, onReadSet?: (readSet: ColumnTopic[]) => void): T =>
  new Proxy(stub, {
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
        onReadSet?.(readSet);
        return result;
      };
    },
  });
