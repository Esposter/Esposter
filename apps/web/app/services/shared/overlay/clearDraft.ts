import type { OverlayDraft } from "#src/models/shared/overlay/OverlayDraft";

export const clearDraft = (draft: OverlayDraft): void => {
  for (const handle of draft.handles) handle.clear();
  draft.handles.clear();
};
