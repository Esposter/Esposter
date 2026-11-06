// @unocss-include
import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";

// How tall the frame inside each placement's dialog stands: a drawer fills its edge, and a dialog that stands at its
// Content's height is held under the limit its placement gives it
export const UiDialogFrameClassMap = {
  [UiDialogPlacement.DrawerBottom]: "max-h-[60dvh]",
  [UiDialogPlacement.DrawerEnd]: "h-full",
  [UiDialogPlacement.DrawerStart]: "h-full",
  [UiDialogPlacement.FullScreen]: "h-full",
  [UiDialogPlacement.High]: "max-h-[76dvh]",
  [UiDialogPlacement.Middle]: "max-h-[76dvh]",
} as const satisfies Record<UiDialogPlacement, string>;
