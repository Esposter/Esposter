import { checkIsMessageId } from "#src/services/message/checkIsMessageId";

// The one read of a message id out of a string: the number it names, or undefined where no message is named. The
// Canonical-digits rule stays in checkIsMessageId, so the check and the number cannot be taken from two places
export const parseMessageId = (value: string) => (checkIsMessageId(value) ? Number(value) : undefined);
