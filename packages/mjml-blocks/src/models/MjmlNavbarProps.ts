import type { MjmlNavbarLinkNode } from "#src/models/MjmlNavbarLinkNode";
import type { MjmlRawNode } from "#src/models/MjmlRawNode";
import type { BlockNodeProps } from "headless-block-editor";

// The props an MJML navbar node holds: its attributes as MJML takes them, its children
export interface MjmlNavbarProps extends BlockNodeProps {
  align?: string;
  "base-url"?: string;
  children: (MjmlNavbarLinkNode | MjmlRawNode)[];
  hamburger?: string;
  "ico-align"?: string;
  "ico-close"?: string;
  "ico-color"?: string;
  "ico-font-family"?: string;
  "ico-font-size"?: string;
  "ico-line-height"?: string;
  "ico-open"?: string;
  "ico-padding"?: string;
  "ico-padding-bottom"?: string;
  "ico-padding-left"?: string;
  "ico-padding-right"?: string;
  "ico-padding-top"?: string;
  "ico-text-decoration"?: string;
  "ico-text-transform"?: string;
  padding?: string;
  "padding-bottom"?: string;
  "padding-left"?: string;
  "padding-right"?: string;
  "padding-top"?: string;
}
