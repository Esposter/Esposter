import type { BlockNodeProps } from "vue-block-editor-headless";

// The props an MJML table node holds: its attributes as MJML takes them, its content
export interface MjmlTableProps extends BlockNodeProps {
  align?: string | undefined;
  border?: string | undefined;
  cellpadding?: string | undefined;
  cellspacing?: string | undefined;
  color?: string | undefined;
  "container-background-color"?: string | undefined;
  content: string;
  "font-family"?: string | undefined;
  "font-size"?: string | undefined;
  "font-weight"?: string | undefined;
  "line-height"?: string | undefined;
  padding?: string | undefined;
  "padding-bottom"?: string | undefined;
  "padding-left"?: string | undefined;
  "padding-right"?: string | undefined;
  "padding-top"?: string | undefined;
  role?: string | undefined;
  "table-layout"?: string | undefined;
  "vertical-align"?: string | undefined;
  width?: string | undefined;
}
