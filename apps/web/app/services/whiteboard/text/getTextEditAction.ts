import { WhiteboardTextEditAction } from "@/models/whiteboard/WhiteboardTextEditAction";

// What a key does to a text edit in place: Enter commits, unless Shift holds it for a line break, and Escape discards. A key pressed during
// An input-method composition is the composition's own, since the input method uses Enter and Escape to confirm or cancel it
export const getTextEditAction = (event: KeyboardEvent): WhiteboardTextEditAction | undefined => {
  if (event.isComposing) return undefined;
  if (event.key === "Escape") return WhiteboardTextEditAction.Discard;

  return event.key === "Enter" && !event.shiftKey ? WhiteboardTextEditAction.Commit : undefined;
};
