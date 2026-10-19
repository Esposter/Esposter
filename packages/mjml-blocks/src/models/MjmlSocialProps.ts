import type { MjmlRawNode } from "#src/models/MjmlRawNode";
import type { MjmlSocialElementNode } from "#src/models/MjmlSocialElementNode";
import type { BlockNodeProps } from "headless-block-editor";

// The props an MJML social node holds: its attributes as MJML takes them, its children
export interface MjmlSocialProps extends BlockNodeProps {
  align?: string;
  border?: string;
  "border-radius"?: string;
  children: (MjmlRawNode | MjmlSocialElementNode)[];
  color?: string;
  "container-background-color"?: string;
  "font-family"?: string;
  "font-size"?: string;
  "font-style"?: string;
  "font-weight"?: string;
  "icon-height"?: string;
  "icon-padding"?: string;
  "icon-size"?: string;
  "inner-padding"?: string;
  "line-height"?: string;
  mode?: string;
  padding?: string;
  "padding-bottom"?: string;
  "padding-left"?: string;
  "padding-right"?: string;
  "padding-top"?: string;
  "table-layout"?: string;
  "text-decoration"?: string;
  "text-padding"?: string;
  "vertical-align"?: string;
}
