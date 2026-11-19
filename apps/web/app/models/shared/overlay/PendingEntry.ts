import type { Confirmation } from "#src/models/shared/overlay/Confirmation";
import type { Entry } from "#src/models/shared/overlay/Entry";

// A write's entry from the moment it is issued until its settlement. `confirmed` is set when the server answers.
// `onError` takes the error of an entry that throws in the view, since that error belongs to the write, and
// `reported` is set once that error has gone to it
export interface PendingEntry {
  confirmed?: Confirmation[];
  entry: Entry;
  onError?: ((error: Error) => void) | undefined;
  reported?: true | undefined;
}
