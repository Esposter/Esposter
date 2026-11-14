// How many times a dead letter is republished to its source queue before it is quarantined.
// Every message is counted on its own, so one that keeps failing is quarantined alone.
// The transient failures delivered beside it are not held back.
export const MAX_DEAD_LETTER_ATTEMPTS = 3;
