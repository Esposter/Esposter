import { MessageCreationRejectionType } from "@esposter/db-schema";

// What the sender is told, per rule. The decision itself carries only its type — the same one the Function
// Worker reads, where nobody is waiting to be told anything — so the sentence lives here, on the tRPC side with a
// Person on the other end, for whom a bare code says neither what stopped the message nor whether waiting helps
export const MessageCreationRejectionReasonMap: Record<MessageCreationRejectionType, string> = {
  [MessageCreationRejectionType.NotAMember]: "You are not a member of this room.",
  [MessageCreationRejectionType.ReadOnly]: "This room is read-only.",
  [MessageCreationRejectionType.Slowmode]: "Slowmode is on — wait before sending another message.",
  [MessageCreationRejectionType.Timeout]: "You are timed out in this room.",
  [MessageCreationRejectionType.WordFilter]: "Message contains blocked content.",
};
