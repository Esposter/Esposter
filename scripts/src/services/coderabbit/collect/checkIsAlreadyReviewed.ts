// The probe's reply is either the bot saying the checkpoint already covers the head, or the walkthrough of a
// Review that just started. Only the first lets the collector proceed.
const ALREADY_REVIEWED_REGEX = /already reviewed/iu;

export const checkIsAlreadyReviewed = (reply: string): boolean => ALREADY_REVIEWED_REGEX.test(reply);
