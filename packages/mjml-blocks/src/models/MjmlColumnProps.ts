import type { MjmlFlowNode } from "#src/models/MjmlFlowNode";
import type { MjmlLeafNode } from "#src/models/MjmlLeafNode";
import type { BlockNodeProps } from "headless-block-editor";

// The props an MJML column node holds: its attributes as MJML takes them, its children
export interface MjmlColumnProps extends BlockNodeProps {
  "background-color"?: string;
  border?: string;
  "border-bottom"?: string;
  "border-left"?: string;
  "border-radius"?: string;
  "border-right"?: string;
  "border-top"?: string;
  children: (MjmlFlowNode | MjmlLeafNode)[];
  direction?: string;
  "inner-background-color"?: string;
  "inner-border"?: string;
  "inner-border-bottom"?: string;
  "inner-border-left"?: string;
  "inner-border-radius"?: string;
  "inner-border-right"?: string;
  "inner-border-top"?: string;
  padding?: string;
  "padding-bottom"?: string;
  "padding-left"?: string;
  "padding-right"?: string;
  "padding-top"?: string;
  "vertical-align"?: string;
  width?: string;
}
