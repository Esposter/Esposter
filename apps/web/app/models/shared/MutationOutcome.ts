import type { MutationStatus } from "@/models/shared/MutationStatus";

export type MutationOutcome<TResult> =
  | { error: Error; status: MutationStatus.Failed }
  | { result: TResult; status: MutationStatus.Succeeded }
  | { status: MutationStatus.Dropped }
  | { status: MutationStatus.Stale };
