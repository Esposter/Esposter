import type { ObjectInvocation } from "#src/models/realtime/ObjectInvocation";

// The one entry every Durable Object answers its RPC methods through, as much of it as a caller reads. Structural,
// Since each Worker types the object's stub from its own copy of the Workers types
export interface ObjectInvoker {
  invoke: (method: string, args: unknown[]) => Promise<ObjectInvocation>;
}
