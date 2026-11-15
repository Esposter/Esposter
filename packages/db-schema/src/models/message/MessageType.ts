export const MessageType = {
  Call: "Call",
  EditRoom: "EditRoom",
  Message: "Message",
  PinMessage: "PinMessage",
  Poll: "Poll",
  System: "System",
  Webhook: "Webhook",
} as const;
export type MessageType = (typeof MessageType)[keyof typeof MessageType];

export const MessageTypes: readonly MessageType[] = Object.values(MessageType);
