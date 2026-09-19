// Below this, nothing acts on an answer and the case goes up a tier: it is the floor under every gate, not a
// Quality bar (`llm-delegation` skill)
export const CONFIDENCE_FLOOR = 0.6;

// What a decision that writes outside the checkout needs instead — a push, a merge, a label on someone's issue.
// The cost of being wrong there is not a retry, so the band between this and its complement escalates.
export const HIGH_STAKES_CONFIDENCE = 0.85;
