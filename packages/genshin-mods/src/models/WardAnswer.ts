export const WardAnswer = { Cancel: "Cancel", Proceed: "Proceed", Worktree: "Move to a worktree" } as const;
export type WardAnswer = (typeof WardAnswer)[keyof typeof WardAnswer];

// In the order the question offers them
export const WardAnswers: readonly WardAnswer[] = [WardAnswer.Proceed, WardAnswer.Worktree, WardAnswer.Cancel];
