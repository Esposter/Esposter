import type { MjmlFlowNode } from "#src/models/MjmlFlowNode";
import type { MjmlLeafNode } from "#src/models/MjmlLeafNode";
import type { BlockNodeProps } from "vue-block-editor-headless";

// The props an MJML hero node holds: its attributes as MJML takes them, its children
export interface MjmlHeroProps extends BlockNodeProps {
  "background-color"?: string | undefined;
  "background-height"?: string | undefined;
  "background-position"?: string | undefined;
  "background-url"?: string | undefined;
  "background-width"?: string | undefined;
  "border-radius"?: string | undefined;
  children: (MjmlFlowNode | MjmlLeafNode)[];
  height?: string | undefined;
  "inner-background-color"?: string | undefined;
  "inner-padding"?: string | undefined;
  "inner-padding-bottom"?: string | undefined;
  "inner-padding-left"?: string | undefined;
  "inner-padding-right"?: string | undefined;
  "inner-padding-top"?: string | undefined;
  mode?: string | undefined;
  padding?: string | undefined;
  "padding-bottom"?: string | undefined;
  "padding-left"?: string | undefined;
  "padding-right"?: string | undefined;
  "padding-top"?: string | undefined;
  "vertical-align"?: string | undefined;
}
