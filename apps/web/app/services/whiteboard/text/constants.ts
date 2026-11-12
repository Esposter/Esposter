import type { UiMenuItem } from "@/models/ui/UiMenuItem";
import type { CSSProperties } from "vue";

import { HorizontalAlignment, TextAnchor, TextSize, VerticalAlignment } from "vue-block-editor-headless";

// The sizes a text takes, each named by the letter the properties panel offers it
export const WHITEBOARD_TEXT_SIZE_ITEMS: UiMenuItem<TextSize>[] = [
  { title: "S", value: TextSize.Small },
  { title: "M", value: TextSize.Medium },
  { title: "L", value: TextSize.Large },
  { title: "XL", value: TextSize.ExtraLarge },
];
// The horizontal alignments a shape's, a sticky note's or a text box's text takes, each named as the properties panel offers it
export const WHITEBOARD_HORIZONTAL_ALIGNMENT_ITEMS: UiMenuItem<HorizontalAlignment>[] = [
  { title: "Left", value: HorizontalAlignment.Left },
  { title: "Centre", value: HorizontalAlignment.Center },
  { title: "Right", value: HorizontalAlignment.Right },
];
// The vertical alignments a shape's or a sticky note's text takes, each named as the properties panel offers it
export const WHITEBOARD_VERTICAL_ALIGNMENT_ITEMS: UiMenuItem<VerticalAlignment>[] = [
  { title: "Top", value: VerticalAlignment.Top },
  { title: "Middle", value: VerticalAlignment.Middle },
  { title: "Bottom", value: VerticalAlignment.Bottom },
];
// How the draft in the overlay editor lines up with the text it stands for: the CSS text alignment, and the share of its own width that its box moves by
// so its anchor sits on the point the text is drawn from
export const WHITEBOARD_TEXT_EDIT_ANCHOR_MAP: Record<
  TextAnchor,
  { shift: string; textAlign: CSSProperties["textAlign"] }
> = {
  [TextAnchor.End]: { shift: "-100%", textAlign: "right" },
  [TextAnchor.Middle]: { shift: "-50%", textAlign: "center" },
  [TextAnchor.Start]: { shift: "0", textAlign: "left" },
};
// The share of its own height that the overlay editor moves by, so a middle or bottom alignment sits on the point the text is drawn from
export const WHITEBOARD_TEXT_EDIT_VERTICAL_SHIFT_MAP: Record<VerticalAlignment, string> = {
  [VerticalAlignment.Bottom]: "-100%",
  [VerticalAlignment.Middle]: "-50%",
  [VerticalAlignment.Top]: "0",
};
