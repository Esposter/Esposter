import type { MjmlAccordionTextNode } from "#src/models/MjmlAccordionTextNode";
import type { MjmlAccordionTitleNode } from "#src/models/MjmlAccordionTitleNode";
import type { MjmlRawNode } from "#src/models/MjmlRawNode";
import type { BlockNodeProps } from "headless-block-editor";

// The props an MJML accordion element node holds: its attributes as MJML takes them, its children
export interface MjmlAccordionElementProps extends BlockNodeProps {
  "background-color"?: string;
  border?: string;
  children: (MjmlAccordionTextNode | MjmlAccordionTitleNode | MjmlRawNode)[];
  "font-family"?: string;
  "icon-align"?: string;
  "icon-height"?: string;
  "icon-position"?: string;
  "icon-unwrapped-alt"?: string;
  "icon-unwrapped-url"?: string;
  "icon-width"?: string;
  "icon-wrapped-alt"?: string;
  "icon-wrapped-url"?: string;
}
