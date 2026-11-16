import type { MjmlColumnNode } from "#src/models/MjmlColumnNode";
import type { MjmlGroupNode } from "#src/models/MjmlGroupNode";
import type { MjmlRawNode } from "#src/models/MjmlRawNode";
import type { BlockNodeProps } from "vue-block-editor-headless";

// The props an MJML section node holds: its attributes as MJML takes them, its children
export interface MjmlSectionProps extends BlockNodeProps {
  "background-color"?: string | undefined;
  "background-position"?: string | undefined;
  "background-position-x"?: string | undefined;
  "background-position-y"?: string | undefined;
  "background-repeat"?: string | undefined;
  "background-size"?: string | undefined;
  "background-url"?: string | undefined;
  border?: string | undefined;
  "border-bottom"?: string | undefined;
  "border-left"?: string | undefined;
  "border-radius"?: string | undefined;
  "border-right"?: string | undefined;
  "border-top"?: string | undefined;
  children: (MjmlColumnNode | MjmlGroupNode | MjmlRawNode)[];
  direction?: string | undefined;
  "full-width"?: string | undefined;
  gutter?: string | undefined;
  padding?: string | undefined;
  "padding-bottom"?: string | undefined;
  "padding-left"?: string | undefined;
  "padding-right"?: string | undefined;
  "padding-top"?: string | undefined;
  "text-align"?: string | undefined;
  "text-padding"?: string | undefined;
}
