import type { MjmlAccordionTextNode } from "#src/models/MjmlAccordionTextNode";
import type { MjmlAccordionTitleNode } from "#src/models/MjmlAccordionTitleNode";
import type { MjmlRawNode } from "#src/models/MjmlRawNode";
import type { BlockNodeProps } from "vue-block-editor-headless";

// The props an MJML accordion element node holds: its attributes as MJML takes them, its children
export interface MjmlAccordionElementProps extends BlockNodeProps {
  "background-color"?: string | undefined;
  border?: string | undefined;
  children: (MjmlAccordionTextNode | MjmlAccordionTitleNode | MjmlRawNode)[];
  "font-family"?: string | undefined;
  "icon-align"?: string | undefined;
  "icon-height"?: string | undefined;
  "icon-position"?: string | undefined;
  "icon-unwrapped-alt"?: string | undefined;
  "icon-unwrapped-url"?: string | undefined;
  "icon-width"?: string | undefined;
  "icon-wrapped-alt"?: string | undefined;
  "icon-wrapped-url"?: string | undefined;
}
