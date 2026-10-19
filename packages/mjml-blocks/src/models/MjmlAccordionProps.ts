import type { MjmlAccordionElementNode } from "#src/models/MjmlAccordionElementNode";
import type { MjmlRawNode } from "#src/models/MjmlRawNode";
import type { BlockNodeProps } from "headless-block-editor";

// The props an MJML accordion node holds: its attributes as MJML takes them, its children
export interface MjmlAccordionProps extends BlockNodeProps {
  border?: string;
  children: (MjmlAccordionElementNode | MjmlRawNode)[];
  "container-background-color"?: string;
  "font-family"?: string;
  "icon-align"?: string;
  "icon-height"?: string;
  "icon-position"?: string;
  "icon-unwrapped-alt"?: string;
  "icon-unwrapped-url"?: string;
  "icon-width"?: string;
  "icon-wrapped-alt"?: string;
  "icon-wrapped-url"?: string;
  padding?: string;
  "padding-bottom"?: string;
  "padding-left"?: string;
  "padding-right"?: string;
  "padding-top"?: string;
}
