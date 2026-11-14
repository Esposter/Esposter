// A message id is the room's own positive integer, so a route param or a stored key that is no such integer names no
// message at all
export const checkIsMessageId = (value: string) => {
  const messageId = Number(value);
  return Number.isSafeInteger(messageId) && messageId > 0;
};
