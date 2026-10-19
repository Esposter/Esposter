import type { MjmlFlowNode } from "#src/models/MjmlFlowNode";
import type { MjmlLeafNode } from "#src/models/MjmlLeafNode";
import type { BlockNodeProps } from "headless-block-editor";

// The props an MJML hero node holds: its attributes as MJML takes them, its children
export interface MjmlHeroProps extends BlockNodeProps {
  "background-color"?: string;
  "background-height"?: string;
  "background-position"?: string;
  "background-url"?: string;
  "background-width"?: string;
  "border-radius"?: string;
  children: (MjmlFlowNode | MjmlLeafNode)[];
  height?: string;
  "inner-background-color"?: string;
  "inner-padding"?: string;
  "inner-padding-bottom"?: string;
  "inner-padding-left"?: string;
  "inner-padding-right"?: string;
  "inner-padding-top"?: string;
  mode?: string;
  padding?: string;
  "padding-bottom"?: string;
  "padding-left"?: string;
  "padding-right"?: string;
  "padding-top"?: string;
  "vertical-align"?: string;
}
