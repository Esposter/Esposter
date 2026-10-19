import type { BlockNodeProps } from "headless-block-editor";

// The props an MJML table node holds: its attributes as MJML takes them, its content
export interface MjmlTableProps extends BlockNodeProps {
  align?: string;
  border?: string;
  cellpadding?: string;
  cellspacing?: string;
  color?: string;
  "container-background-color"?: string;
  content: string;
  "font-family"?: string;
  "font-size"?: string;
  "font-weight"?: string;
  "line-height"?: string;
  padding?: string;
  "padding-bottom"?: string;
  "padding-left"?: string;
  "padding-right"?: string;
  "padding-top"?: string;
  role?: string;
  "table-layout"?: string;
  "vertical-align"?: string;
  width?: string;
}
