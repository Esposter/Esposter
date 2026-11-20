// A message id is the room's own positive integer, and any other route param or stored key
// Names no message at all, so the parse refuses it rather than reading it as one. Number reads more than the
// Digits, so "012", "1e3", " 12" and "12.0" would each pass a Number-only read while naming a message in a
// Form no id is written in: the parse takes only the canonical digits. Every reader of a message id from a string
// Goes through here, so the check and the number it yields cannot be taken from two places
const MESSAGE_ID_PATTERN = /^[1-9]\d*$/;
export const parseMessageId = (value: string) => {
  if (!MESSAGE_ID_PATTERN.test(value)) return undefined;
  const messageId = Number(value);
  return Number.isSafeInteger(messageId) ? messageId : undefined;
};
