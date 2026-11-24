// The answer a test scripts for an RPC that returns data.
// It is a function of the call's arguments and the object the call was sent to.
export type ObjectReply = (args: unknown[], objectId: string) => unknown;
