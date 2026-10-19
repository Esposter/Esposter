import type { NodeStyle } from "#shared/models/pageBuilder/NodeStyle";
import type { BlockNodeProps } from "headless-block-editor";

// The props a Tooltip node holds: the button's label, the text shown on hover or focus, and the style it is drawn with
export interface TooltipNodeProps extends BlockNodeProps {
  label: string;
  style?: NodeStyle;
  text: string;
}
