import type { MjmlColumnNode } from "#src/models/MjmlColumnNode";
import type { MjmlRawNode } from "#src/models/MjmlRawNode";
import type { BlockNodeProps } from "headless-block-editor";

// The props an MJML group node holds: its attributes as MJML takes them, its children
export interface MjmlGroupProps extends BlockNodeProps {
  "background-color"?: string;
  children: (MjmlColumnNode | MjmlRawNode)[];
  direction?: string;
  "vertical-align"?: string;
  width?: string;
}
