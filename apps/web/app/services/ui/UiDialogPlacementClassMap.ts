// @unocss-include
import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";

// Where each placement stands the dialog. A drawer slides in from its own side at every width, since the button that
// Opened it is on that side, a bottom drawer rises to the height of its content up to most of the window so the page it is
// About stays in view above it, and any other drops from above. Every placement writes its own margins, since the reset
// Zeroes the auto margins the browser centres a dialog with. The height is the frame's, in UiDialogFrameClassMap
export const UiDialogPlacementClassMap = {
  [UiDialogPlacement.DrawerBottom]: "m-0 mt-a max-w-none w-full [--ui-dialog-from:translateY(calc(var(--ui-step)*8))]",
  [UiDialogPlacement.DrawerEnd]:
    "m-0 ml-a h-dvh max-h-dvh max-w-none w-full md:w-1/2 xl:w-2/5 [--ui-dialog-from:translateX(calc(var(--ui-step)*8))]",
  [UiDialogPlacement.DrawerStart]:
    "m-0 mr-a h-dvh max-h-dvh max-w-none w-full md:w-1/2 xl:w-2/5 [--ui-dialog-from:translateX(calc(var(--ui-step)*-8))]",
  // Its width is the dialog's own style, which outranks the width a call site gives the other placements
  [UiDialogPlacement.FullScreen]: "m-0 h-dvh max-h-dvh",
  [UiDialogPlacement.High]: "mx-a mb-a mt-[12dvh]",
  [UiDialogPlacement.Middle]: "m-a",
} as const satisfies Record<UiDialogPlacement, string>;
