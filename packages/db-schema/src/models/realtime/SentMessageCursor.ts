// The last row of a page of sent messages, which the next page starts strictly after
export interface SentMessageCursor {
  createdAt: Date;
  messageId: number;
  roomId: string;
}
