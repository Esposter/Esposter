import type { Entry } from "#src/models/shared/overlay/Entry";

import { resourceTable } from "#src/services/resource/overlay/constants";

// A content save changes no row the screen shows, so its entry only reads the row. The read touches the row's key, which
// Orders the save behind the writes ahead of it on that row, so it sends the contentVersion the write before it answered
export const getSaveResourceEntry =
  (id: string): Entry =>
  (view) => {
    view.get(resourceTable, [id]);
  };
