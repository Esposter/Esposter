import type { WhiteboardPaletteKind } from "@/services/whiteboard/palette/getWhiteboardPaletteKind";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { PositionedElementType, ShapeKind } from "headless-block-editor";

// The icon each thing the palette places wears, keyed by its kind. Typed over every kind, so a missing
// Icon fails the typecheck
export const WhiteboardPaletteIconMap: Record<WhiteboardPaletteKind, UiIconMeaning> = {
  [ShapeKind.Annotation]: UiIconMeaning.Comment,
  [ShapeKind.Decision]: UiIconMeaning.Poll,
  [ShapeKind.Diamond]: UiIconMeaning.Tag,
  [ShapeKind.Ellipse]: UiIconMeaning.Record,
  [ShapeKind.InputOutput]: UiIconMeaning.Send,
  [ShapeKind.PredefinedProcess]: UiIconMeaning.Program,
  [ShapeKind.Process]: UiIconMeaning.Settings,
  [ShapeKind.Rectangle]: UiIconMeaning.Block,
  [ShapeKind.Terminal]: UiIconMeaning.Play,
  [PositionedElementType.StickyNote]: UiIconMeaning.Edit,
  [PositionedElementType.Text]: UiIconMeaning.ReadableText,
};
