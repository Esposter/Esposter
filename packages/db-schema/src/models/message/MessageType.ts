export enum MessageType {
  Call = "Call",
  EditRoom = "EditRoom",
  Message = "Message",
  PinMessage = "PinMessage",
  Poll = "Poll",
  System = "System",
  Webhook = "Webhook",
}

export const MessageTypes: readonly MessageType[] = Object.values(MessageType);
