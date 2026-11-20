import type { ToggleBookmarkInput } from "#shared/models/db/bookmark/ToggleBookmarkInput";

import { PageMarkType } from "#shared/models/app/PageMarkType";

// The one target a bookmark names, held by the column its mark's kind names, with the other column null. A page with no
// Mark has no target
export const getBookmarkTarget = (mark: ToggleBookmarkInput["mark"]) => ({
  resourceId: mark?.type === PageMarkType.Resource ? mark.id : null,
  roomId: mark?.type === PageMarkType.Room ? mark.id : null,
});
