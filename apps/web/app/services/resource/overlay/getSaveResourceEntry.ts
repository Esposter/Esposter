import type { Entry } from "#src/models/shared/overlay/Entry";

import { resourceTable } from "#src/services/resource/overlay/constants";
import { userTable } from "#src/services/user/overlay/constants";

// A content save shows no change, so its entry only reads the rows the server names in its answer: the resource's own,
// And The owner's, whose storage total the save moves. A read touches the row's key, which orders the save behind the
// Writes Ahead of it on either row, so it sends the contentVersion the write before it answered
export const getSaveResourceEntry =
  (id: string, userId: string): Entry =>
  (view) => {
    view.get(resourceTable, [id]);
    view.get(userTable, [userId]);
  };
