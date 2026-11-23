// The answer a test scripts for an RPC that returns data, as a function of the call's arguments and the object it was
// Sent to
export type ObjectReply = (args: unknown[], objectId: string) => unknown;
