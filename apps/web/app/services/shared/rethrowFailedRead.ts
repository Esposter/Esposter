import type { MutationOutcome } from "#src/models/shared/MutationOutcome";

import { MutationStatus } from "#src/models/shared/MutationStatus";

// A live read its caller awaits fails by throwing, as an `await` of the query did: the awaiting surface decides what a
// Throw means to it (a list records it as its error, a component's top-level await fails the component). The refresh a
// Watch runs has no caller to throw to, so it never comes through here, and its own onError logs instead
export const rethrowFailedRead = async <TResult>(outcome: Promise<MutationOutcome<TResult>>) => {
  const settled = await outcome;
  if (settled.status === MutationStatus.Failed) throw settled.error;
};
