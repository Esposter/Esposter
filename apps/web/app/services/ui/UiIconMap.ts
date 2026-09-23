// @unocss-include
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

// The pixel set first, and a Material Design Icons class for a meaning it has no glyph for
export const UiIconMap = {
  [UiIconMeaning.Copy]: "i-pixelarticons:copy",
  [UiIconMeaning.Dropdown]: "i-pixelarticons:chevron-up",
  [UiIconMeaning.Failure]: "i-pixelarticons:close",
  [UiIconMeaning.More]: "i-pixelarticons:more-horizontal",
  [UiIconMeaning.Remove]: "i-pixelarticons:close",
  [UiIconMeaning.Success]: "i-pixelarticons:check",
} as const satisfies Record<UiIconMeaning, string>;
