import type { MjmlNavbarLinkNode } from "#src/models/MjmlNavbarLinkNode";
import type { MjmlRawNode } from "#src/models/MjmlRawNode";
import type { BlockNodeProps } from "vue-block-editor-headless";

// The props an MJML navbar node holds: its attributes as MJML takes them, its children
export interface MjmlNavbarProps extends BlockNodeProps {
  align?: string | undefined;
  "base-url"?: string | undefined;
  children: (MjmlNavbarLinkNode | MjmlRawNode)[];
  hamburger?: string | undefined;
  "ico-align"?: string | undefined;
  "ico-close"?: string | undefined;
  "ico-color"?: string | undefined;
  "ico-font-family"?: string | undefined;
  "ico-font-size"?: string | undefined;
  "ico-line-height"?: string | undefined;
  "ico-open"?: string | undefined;
  "ico-padding"?: string | undefined;
  "ico-padding-bottom"?: string | undefined;
  "ico-padding-left"?: string | undefined;
  "ico-padding-right"?: string | undefined;
  "ico-padding-top"?: string | undefined;
  "ico-text-decoration"?: string | undefined;
  "ico-text-transform"?: string | undefined;
  padding?: string | undefined;
  "padding-bottom"?: string | undefined;
  "padding-left"?: string | undefined;
  "padding-right"?: string | undefined;
  "padding-top"?: string | undefined;
}
