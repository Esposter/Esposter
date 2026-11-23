import type { ObjectInvocationHandles } from "#src/models/durableObject/ObjectInvocationHandles";

import { AsyncLocalStorage } from "node:async_hooks";

// The scope an invocation runs in. An object's handles read it when a statement runs, so the statements the
// Invocation's Method awaits are recorded into its own handles and none of another invocation's
export const objectInvocationStorage = new AsyncLocalStorage<ObjectInvocationHandles>();
