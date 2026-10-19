import type { MjmlColumnNode } from "#src/models/MjmlColumnNode";
import type { MjmlGroupNode } from "#src/models/MjmlGroupNode";
import type { MjmlRawNode } from "#src/models/MjmlRawNode";
import type { BlockNodeProps } from "headless-block-editor";

// The props an MJML section node holds: its attributes as MJML takes them, its children
export interface MjmlSectionProps extends BlockNodeProps {
  "background-color"?: string;
  "background-position"?: string;
  "background-position-x"?: string;
  "background-position-y"?: string;
  "background-repeat"?: string;
  "background-size"?: string;
  "background-url"?: string;
  border?: string;
  "border-bottom"?: string;
  "border-left"?: string;
  "border-radius"?: string;
  "border-right"?: string;
  "border-top"?: string;
  children: (MjmlColumnNode | MjmlGroupNode | MjmlRawNode)[];
  direction?: string;
  "full-width"?: string;
  gutter?: string;
  padding?: string;
  "padding-bottom"?: string;
  "padding-left"?: string;
  "padding-right"?: string;
  "padding-top"?: string;
  "text-align"?: string;
  "text-padding"?: string;
}
