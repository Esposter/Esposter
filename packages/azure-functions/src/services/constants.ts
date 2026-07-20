// Event Grid only dead-letters an event after its own retry policy is exhausted, so a replay that
// Dead-letters again is evidence of a persistent fault rather than a transient one. Two replays absorb
// A genuine outage window without letting a poison payload cycle through the container forever.
export const MAX_DEAD_LETTER_REPLAY_ATTEMPTS = 2;
export const REPLAY_ATTEMPTS_METADATA_KEY = "replayAttempts";
