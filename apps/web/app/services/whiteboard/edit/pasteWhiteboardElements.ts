import type { WhiteboardEditState } from "#src/models/whiteboard/WhiteboardEditState";

import { copyWhiteboardElements } from "#src/services/whiteboard/edit/copyWhiteboardElements";
import { parseClipboardElements } from "#src/services/whiteboard/serializeClipboardElements";

// The state after clipboard text is pasted as copies of the elements it carries, with the copies' ids to select as
// One edit. Text that carries no whiteboard elements pastes nothing, so none is returned for it and the state is left
// As it was
export const pasteWhiteboardElements = (
  state: WhiteboardEditState,
  text: string,
): { copiedIds: string[]; state: WhiteboardEditState } | undefined => {
  const elements = parseClipboardElements(text);
  if (elements === undefined) return undefined;

  return copyWhiteboardElements(state, elements);
};
