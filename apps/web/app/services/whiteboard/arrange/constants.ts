import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { AlignEdge } from "#src/models/whiteboard/AlignEdge";
import { StackMove } from "#src/models/whiteboard/StackMove";

// The fewest boxes an align lines up, since one box has no edge to line up with, and the fewest a distribute spaces, since two boxes share no gap
export const WHITEBOARD_ALIGN_MINIMUM_BOXES = 2;
export const WHITEBOARD_DISTRIBUTE_MINIMUM_BOXES = 3;

// The align controls of a selection, in the order the row draws them: each edge or centre, with the icon and the label it reads as
export const WHITEBOARD_ALIGN_ITEMS = [
  { edge: AlignEdge.Left, label: "Align left", meaning: UiIconMeaning.AlignLeft },
  { edge: AlignEdge.Centre, label: "Align centre", meaning: UiIconMeaning.AlignCentre },
  { edge: AlignEdge.Right, label: "Align right", meaning: UiIconMeaning.AlignRight },
  { edge: AlignEdge.Top, label: "Align top", meaning: UiIconMeaning.AlignTop },
  { edge: AlignEdge.Middle, label: "Align middle", meaning: UiIconMeaning.AlignMiddle },
  { edge: AlignEdge.Bottom, label: "Align bottom", meaning: UiIconMeaning.AlignBottom },
] as const;

// The stacking controls of a selection, in the order the row draws them: each step with the icon and the label it reads as
export const WHITEBOARD_STACK_ITEMS = [
  { label: "Send to back", meaning: UiIconMeaning.SendToBack, move: StackMove.SendToBack },
  { label: "Send backward", meaning: UiIconMeaning.SendBackward, move: StackMove.SendBackward },
  { label: "Bring forward", meaning: UiIconMeaning.BringForward, move: StackMove.BringForward },
  { label: "Bring to front", meaning: UiIconMeaning.BringToFront, move: StackMove.BringToFront },
] as const;
