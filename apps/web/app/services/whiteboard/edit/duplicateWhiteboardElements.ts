import type { WhiteboardEditState } from "@/models/whiteboard/WhiteboardEditState";

import { copyWhiteboardElements } from "@/services/whiteboard/edit/copyWhiteboardElements";

// Copies each element of a selection on top of the element list, as one edit. Returns the copies' ids, which the selection moves onto
export const duplicateWhiteboardElements = (
  state: WhiteboardEditState,
  elementIds: string[],
): { copiedIds: string[]; state: WhiteboardEditState } =>
  copyWhiteboardElements(
    state,
    state.document.elements.filter(({ id }) => elementIds.includes(id)),
  );
