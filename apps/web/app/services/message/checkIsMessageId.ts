// A message id is the room's own positive integer, and any other route param or stored key
// Names no message at all, so the check refuses it rather than reading it as one. Number reads more than the
// Digits, so "012", "1e3", " 12" and "12.0" would each pass a Number-only check while naming a message in a
// Form no id is written in: the check takes only the canonical digits
const MESSAGE_ID_REGEX = /^[1-9]\d*$/u;
export const checkIsMessageId = (value: string) => MESSAGE_ID_REGEX.test(value) && Number.isSafeInteger(Number(value));
