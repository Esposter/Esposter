import type { ObjectReply } from "#src/workers/models/ObjectReply";

// The answers a test scripts for a room object's RPCs, keyed by method
export const roomObjectReplies: Map<string, ObjectReply> = new Map<string, ObjectReply>();
