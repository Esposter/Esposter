// @unocss-include
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

// The pixel set first, and a Material Design Icons class for a meaning it has no glyph for
export const UiIconMap = {
  [UiIconMeaning.Achievement]: "i-pixelarticons:trophy",
  [UiIconMeaning.Bookmark]: "i-pixelarticons:bookmark",
  [UiIconMeaning.Collapse]: "i-pixelarticons:collapse",
  [UiIconMeaning.Command]: "i-pixelarticons:command",
  [UiIconMeaning.Copy]: "i-pixelarticons:copy",
  [UiIconMeaning.Device]: "i-pixelarticons:monitor",
  [UiIconMeaning.Disclosure]: "i-pixelarticons:chevron-right",
  [UiIconMeaning.Dropdown]: "i-pixelarticons:chevron-down",
  [UiIconMeaning.Edit]: "i-pixelarticons:pencil",
  [UiIconMeaning.Expand]: "i-pixelarticons:expand",
  [UiIconMeaning.Failure]: "i-pixelarticons:close",
  [UiIconMeaning.Info]: "i-pixelarticons:info-box",
  [UiIconMeaning.Launcher]: "i-pixelarticons:grid-3x3",
  [UiIconMeaning.Menu]: "i-pixelarticons:menu",
  [UiIconMeaning.More]: "i-pixelarticons:more-horizontal",
  [UiIconMeaning.Next]: "i-pixelarticons:chevron-right",
  [UiIconMeaning.Notifications]: "i-pixelarticons:bell",
  [UiIconMeaning.Previous]: "i-pixelarticons:chevron-left",
  [UiIconMeaning.Remove]: "i-pixelarticons:close",
  [UiIconMeaning.ResetView]: "i-pixelarticons:reload",
  [UiIconMeaning.ScrollToTop]: "i-pixelarticons:arrow-up",
  [UiIconMeaning.Search]: "i-pixelarticons:search",
  [UiIconMeaning.SignIn]: "i-pixelarticons:login",
  [UiIconMeaning.Success]: "i-pixelarticons:check",
  [UiIconMeaning.Upload]: "i-pixelarticons:upload",
  [UiIconMeaning.Warning]: "i-pixelarticons:warning-box",
  [UiIconMeaning.ZoomIn]: "i-pixelarticons:zoom-in",
  [UiIconMeaning.ZoomOut]: "i-pixelarticons:zoom-out",
} as const satisfies Record<UiIconMeaning, string>;
