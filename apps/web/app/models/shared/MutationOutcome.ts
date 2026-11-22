import type { MutationStatus } from "#src/models/shared/MutationStatus";

// The three ways a call can end, so a caller can tell a persisted write from one that was dropped as a duplicate,
// Superseded by a newer run of its scope, or rejected — the operation's own rejection never escapes, so this is the only
// Signal it did not land. A throwing callback does escape: the promise an entry point returns is rejected by a throw
// From onSuccess or onError, and nothing here catches them
export type MutationOutcome<TResult> =
  | { error: Error; status: typeof MutationStatus.Failed }
  | { result: TResult; status: typeof MutationStatus.Succeeded }
  | { status: typeof MutationStatus.Dropped };
