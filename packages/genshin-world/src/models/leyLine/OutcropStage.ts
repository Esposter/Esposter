// Where one outcrop stands in its fight and its claim: waiting to be touched, fought until its enemies fall, cleared
// Until it is claimed, and claimed where no place is left to move to, until the daily reset
export const OutcropStage = {
  Claimed: "Claimed",
  Cleared: "Cleared",
  Fighting: "Fighting",
  Waiting: "Waiting",
} as const;
export type OutcropStage = (typeof OutcropStage)[keyof typeof OutcropStage];
