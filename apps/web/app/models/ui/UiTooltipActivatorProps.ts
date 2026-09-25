import type { TooltipActivatorSlotProps } from "@vuetify/v0";

// What a tooltip hands the element it names: only the handlers and the anchor. The primitive's other attributes would
// Overwrite what the element itself sets, a button's type and disabled state among them, and a label the element
// Already carries needs no description too
export type UiTooltipActivatorProps = Pick<
  TooltipActivatorSlotProps["attrs"],
  "onBlur" | "onClick" | "onFocus" | "onKeydown" | "onPointerenter" | "onPointerleave"
> & { style: TooltipActivatorSlotProps["styles"] };
