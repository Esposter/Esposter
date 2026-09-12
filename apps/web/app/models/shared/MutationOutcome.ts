import type { MutationStatus } from "@/models/shared/MutationStatus";

// The four ways a call can end, so a caller can tell a persisted write from one that was dropped as a duplicate,
// Superseded by a newer call, or rejected — the operation's own rejection never escapes, so this is the only
// Signal it did not land. A throwing callback does escape: the promise an entry point returns is rejected by a throw
// From applyOptimistic, from the rollback it returns, or from onSuccess/onError, and nothing here catches them
export type MutationOutcome<TResult> =
  | { error: Error; status: MutationStatus.Failed }
  | { result: TResult; status: MutationStatus.Succeeded }
  | { status: MutationStatus.Dropped }
  | { status: MutationStatus.Stale };
