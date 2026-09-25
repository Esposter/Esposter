// @unocss-include
import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";

// Where each placement stands the dialog. A sheet arrives from the edge it stands on: up from the bottom on a narrow
// Screen, in from the right on a wide one, and any other drops from above. Every placement writes its own margins,
// Since the reset zeroes the auto margins the browser centres a dialog with
export const UiDialogPlacementClassMap = {
  [UiDialogPlacement.FullScreen]: "m-0 h-dvh max-h-dvh max-w-none w-full",
  [UiDialogPlacement.High]: "mx-a mb-a mt-[12dvh] max-h-[76dvh]",
  [UiDialogPlacement.Middle]: "m-a max-h-[76dvh]",
  [UiDialogPlacement.Sheet]:
    "m-0 h-dvh max-h-dvh max-w-none w-full md:ml-a md:w-1/2 xl:w-2/5 [--ui-dialog-from:translateY(calc(var(--ui-step)*8))] md:[--ui-dialog-from:translateX(calc(var(--ui-step)*8))]",
} as const satisfies Record<UiDialogPlacement, string>;
