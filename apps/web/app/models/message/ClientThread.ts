import type { ClientMessage } from "#src/models/message/ClientMessage";
import type { RoomThread } from "@esposter/db-schema";

// A thread as the client lists it: its root as the client holds a message, with the thread's reply summary
export type ClientThread = ClientMessage & Pick<RoomThread, "lastReplyAt" | "replyCount">;
