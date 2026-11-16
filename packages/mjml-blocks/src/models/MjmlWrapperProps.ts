import type { MjmlHeroNode } from "#src/models/MjmlHeroNode";
import type { MjmlRawNode } from "#src/models/MjmlRawNode";
import type { MjmlSectionNode } from "#src/models/MjmlSectionNode";
import type { BlockNodeProps } from "vue-block-editor-headless";

// The props an MJML wrapper node holds: its attributes as MJML takes them, its children
export interface MjmlWrapperProps extends BlockNodeProps {
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
  children: (MjmlHeroNode | MjmlRawNode | MjmlSectionNode)[];
  direction?: string | undefined;
  "full-width"?: string | undefined;
  gap?: string | undefined;
  gutter?: string | undefined;
  padding?: string | undefined;
  "padding-bottom"?: string | undefined;
  "padding-left"?: string | undefined;
  "padding-right"?: string | undefined;
  "padding-top"?: string | undefined;
  "text-align"?: string | undefined;
  "text-padding"?: string | undefined;
}
