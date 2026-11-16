import type { MjmlFlowNode } from "#src/models/MjmlFlowNode";
import type { MjmlLeafNode } from "#src/models/MjmlLeafNode";
import type { BlockNodeProps } from "vue-block-editor-headless";

// The props an MJML column node holds: its attributes as MJML takes them, its children
export interface MjmlColumnProps extends BlockNodeProps {
  "background-color"?: string | undefined;
  border?: string | undefined;
  "border-bottom"?: string | undefined;
  "border-left"?: string | undefined;
  "border-radius"?: string | undefined;
  "border-right"?: string | undefined;
  "border-top"?: string | undefined;
  children: (MjmlFlowNode | MjmlLeafNode)[];
  direction?: string | undefined;
  "inner-background-color"?: string | undefined;
  "inner-border"?: string | undefined;
  "inner-border-bottom"?: string | undefined;
  "inner-border-left"?: string | undefined;
  "inner-border-radius"?: string | undefined;
  "inner-border-right"?: string | undefined;
  "inner-border-top"?: string | undefined;
  padding?: string | undefined;
  "padding-bottom"?: string | undefined;
  "padding-left"?: string | undefined;
  "padding-right"?: string | undefined;
  "padding-top"?: string | undefined;
  "vertical-align"?: string | undefined;
  width?: string | undefined;
}
