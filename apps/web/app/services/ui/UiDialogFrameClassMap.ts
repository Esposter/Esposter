// @unocss-include
import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";

// How tall the frame inside each placement's dialog stands, in the two forms it takes. A dialog that stands at its
// Content's height is held under the limit its placement gives it, and a tall one stands at a fixed height there, so a
// Two-pane body has a height to divide. A drawer and the full screen already stand at their edge's height, so both forms
// Are the same for them
export const UiDialogFrameClassMap = {
  [UiDialogPlacement.DrawerBottom]: { height: "max-h-[60dvh]", tallHeight: "max-h-[60dvh]" },
  [UiDialogPlacement.DrawerEnd]: { height: "h-full", tallHeight: "h-full" },
  [UiDialogPlacement.DrawerStart]: { height: "h-full", tallHeight: "h-full" },
  [UiDialogPlacement.FullScreen]: { height: "h-full", tallHeight: "h-full" },
  [UiDialogPlacement.High]: { height: "max-h-[76dvh]", tallHeight: "h-[76dvh]" },
  [UiDialogPlacement.Middle]: { height: "max-h-[76dvh]", tallHeight: "h-[76dvh]" },
} as const satisfies Record<UiDialogPlacement, { height: string; tallHeight: string }>;
