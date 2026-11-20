import type { ObjectCall } from "#src/workers/models/ObjectCall";

// Every RPC a room's object was sent, in send order, across every room
export const roomObjectCalls: ObjectCall[] = [];
