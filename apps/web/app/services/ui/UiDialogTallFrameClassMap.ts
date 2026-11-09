// @unocss-include
import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";

// How tall the frame stands when it is tall, for the placements that stand in the page: the same height as their cap
// In UiDialogFrameClassMap, held as a fixed height rather than a maximum, so a two-pane body has a height to divide and
// Its panes scroll on their own. A drawer and the full screen already stand at their edge's height, so they are not here
export const UiDialogTallFrameClassMap: Partial<Record<UiDialogPlacement, string>> = {
  [UiDialogPlacement.High]: "h-[76dvh]",
  [UiDialogPlacement.Middle]: "h-[76dvh]",
};
