import type { ReconcileTodoRemindersInput } from "#src/models/todoReminder/ReconcileTodoRemindersInput";
import type { SentMessageCursor } from "#src/models/realtime/SentMessageCursor";

// The RPC surface of a User object, the one contract its class in the functions Worker and the web Worker's callers share
export interface UserObjectRpc {
  addScheduledMessage(scheduledMessage: { roomId: string; runAt: Date; scheduledId: string }): Promise<void>;
  addSentMessage(sentMessage: { createdAt: Date; messageId: number; roomId: string }): Promise<void>;
  reconcileTodoReminders(input: ReconcileTodoRemindersInput): Promise<void>;
  // A room a member can see moved to the top of their list, which every tab of theirs hears of
  roomActivity(roomId: string, updatedAt: Date): void;
  readScheduledMessages(): Promise<{ roomId: string; runAt: Date; scheduledId: string }[]>;
  readSentMessages(input: {
    before?: SentMessageCursor;
    limit: number;
  }): Promise<{ createdAt: Date; messageId: number; roomId: string }[]>;
  removeScheduledMessage(scheduledId: string): Promise<void>;
  removeSentMessage(input: { messageId: number; roomId: string }): Promise<void>;
}
