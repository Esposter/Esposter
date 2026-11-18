import type { RoomMessage } from "#src/models/realtime/RoomMessage";

// A thread as a list of threads shows it: its root message, and how much and how lately it has been replied to
export interface RoomThread extends RoomMessage {
  // Absent while the thread has no reply
  lastReplyAt?: Date;
  replyCount: number;
}
