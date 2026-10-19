import type { BlockNodeProps } from "headless-block-editor";

// The props an MJML spacer node holds: its attributes as MJML takes them
export interface MjmlSpacerProps extends BlockNodeProps {
  border?: string;
  "border-bottom"?: string;
  "border-left"?: string;
  "border-right"?: string;
  "border-top"?: string;
  "container-background-color"?: string;
  height?: string;
  padding?: string;
  "padding-bottom"?: string;
  "padding-left"?: string;
  "padding-right"?: string;
  "padding-top"?: string;
}
