export enum WardAnswer {
  Cancel = "Cancel",
  Proceed = "Proceed",
  Worktree = "Move to a worktree",
}

// In the order the question offers them
export const WardAnswers: readonly WardAnswer[] = [WardAnswer.Proceed, WardAnswer.Worktree, WardAnswer.Cancel];
