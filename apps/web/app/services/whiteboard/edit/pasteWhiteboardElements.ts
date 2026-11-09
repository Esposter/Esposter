import type { WhiteboardEditState } from "@/models/whiteboard/WhiteboardEditState";

import { copyWhiteboardElements } from "@/services/whiteboard/edit/copyWhiteboardElements";
import { parseClipboardElements } from "@/services/whiteboard/serializeClipboardElements";

// The state after clipboard text is pasted as copies of the elements it carries, with the copies' ids to select as one edit. Text that
// Carries no whiteboard elements pastes nothing, so none is returned for it and the state is left as it was
export const pasteWhiteboardElements = (
  state: WhiteboardEditState,
  text: string,
): { copiedIds: string[]; state: WhiteboardEditState } | undefined => {
  const elements = parseClipboardElements(text);
  if (elements === undefined) return undefined;

  return copyWhiteboardElements(state, elements);
};
