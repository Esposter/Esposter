// @unocss-include
import { UiDialogSize } from "@/models/ui/UiDialogSize";

// How wide each size stands, in rems, held to the viewport so a narrow screen leaves the dialog a margin either side.
// Full leaves the page a thinner margin than the others, so it takes more of the screen
export const UiDialogSizeClassMap = {
  [UiDialogSize.Small]: "w-[min(24rem,90vw)]",
  [UiDialogSize.Medium]: "w-[min(32rem,90vw)]",
  [UiDialogSize.Large]: "w-[min(48rem,90vw)]",
  [UiDialogSize.ExtraLarge]: "w-[min(64rem,90vw)]",
  [UiDialogSize.Full]: "w-[min(72rem,96vw)]",
} as const satisfies Record<UiDialogSize, string>;
