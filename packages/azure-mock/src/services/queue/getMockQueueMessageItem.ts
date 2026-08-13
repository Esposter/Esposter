import { MAX_QUEUE_VISIBILITY_TIMEOUT_MS } from "@esposter/db";
// Peek, receive and send all describe the same enqueued message, so its identity and lifetime are built once
export const getMockQueueMessageItem = (
  messageText: string,
): { expiresOn: Date; insertedOn: Date; messageId: string; messageText: string } => {
  const insertedOn = new Date();
  return {
    expiresOn: new Date(insertedOn.getTime() + MAX_QUEUE_VISIBILITY_TIMEOUT_MS),
    insertedOn,
    messageId: crypto.randomUUID(),
    messageText,
  };
};
