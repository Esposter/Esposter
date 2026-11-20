// A message id is the room's own positive integer, and any other route param or stored key
// Names no message at all, so the check refuses it rather than reading it as one
export const checkIsMessageId = (value: string) => {
  const messageId = Number(value);
  return Number.isSafeInteger(messageId) && messageId > 0;
};
