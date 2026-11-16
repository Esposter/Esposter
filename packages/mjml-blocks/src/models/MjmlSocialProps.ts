import type { MjmlRawNode } from "#src/models/MjmlRawNode";
import type { MjmlSocialElementNode } from "#src/models/MjmlSocialElementNode";
import type { BlockNodeProps } from "vue-block-editor-headless";

// The props an MJML social node holds: its attributes as MJML takes them, its children
export interface MjmlSocialProps extends BlockNodeProps {
  align?: string | undefined;
  border?: string | undefined;
  "border-radius"?: string | undefined;
  children: (MjmlRawNode | MjmlSocialElementNode)[];
  color?: string | undefined;
  "container-background-color"?: string | undefined;
  "font-family"?: string | undefined;
  "font-size"?: string | undefined;
  "font-style"?: string | undefined;
  "font-weight"?: string | undefined;
  "icon-height"?: string | undefined;
  "icon-padding"?: string | undefined;
  "icon-size"?: string | undefined;
  "inner-padding"?: string | undefined;
  "line-height"?: string | undefined;
  mode?: string | undefined;
  padding?: string | undefined;
  "padding-bottom"?: string | undefined;
  "padding-left"?: string | undefined;
  "padding-right"?: string | undefined;
  "padding-top"?: string | undefined;
  "table-layout"?: string | undefined;
  "text-decoration"?: string | undefined;
  "text-padding"?: string | undefined;
  "vertical-align"?: string | undefined;
}
