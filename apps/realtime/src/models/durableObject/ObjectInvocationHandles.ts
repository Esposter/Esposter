import type { ObjectHandleRecord } from "#src/models/durableObject/ObjectHandleRecord";

// The recorded handles of one invocation, by the handle each was made over. A handle an invocation never reads is never recorded
export type ObjectInvocationHandles = Map<object, ObjectHandleRecord>;
