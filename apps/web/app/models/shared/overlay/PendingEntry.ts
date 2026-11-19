import type { Confirmation } from "#src/models/shared/overlay/Confirmation";
import type { Entry } from "#src/models/shared/overlay/Entry";

// A write's entry from the moment it is issued until its settlement. `confirmed` is set when the server answers
export interface PendingEntry {
  confirmed?: Confirmation[];
  entry: Entry;
}
