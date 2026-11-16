import type { MjmlAccordionElementNode } from "#src/models/MjmlAccordionElementNode";
import type { MjmlRawNode } from "#src/models/MjmlRawNode";
import type { BlockNodeProps } from "vue-block-editor-headless";

// The props an MJML accordion node holds: its attributes as MJML takes them, its children
export interface MjmlAccordionProps extends BlockNodeProps {
  border?: string | undefined;
  children: (MjmlAccordionElementNode | MjmlRawNode)[];
  "container-background-color"?: string | undefined;
  "font-family"?: string | undefined;
  "icon-align"?: string | undefined;
  "icon-height"?: string | undefined;
  "icon-position"?: string | undefined;
  "icon-unwrapped-alt"?: string | undefined;
  "icon-unwrapped-url"?: string | undefined;
  "icon-width"?: string | undefined;
  "icon-wrapped-alt"?: string | undefined;
  "icon-wrapped-url"?: string | undefined;
  padding?: string | undefined;
  "padding-bottom"?: string | undefined;
  "padding-left"?: string | undefined;
  "padding-right"?: string | undefined;
  "padding-top"?: string | undefined;
}
