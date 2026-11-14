// How many times a dead letter is republished to its source queue before it is quarantined. Counted on each message, so a
// message that keeps failing is quarantined without holding back the transient failures delivered beside it
export const MAX_DEAD_LETTER_ATTEMPTS = 3;
