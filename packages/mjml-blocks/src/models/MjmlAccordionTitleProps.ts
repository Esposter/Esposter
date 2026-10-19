import type { BlockNodeProps } from "headless-block-editor";

// The props an MJML accordion title node holds: its attributes as MJML takes them, its content
export interface MjmlAccordionTitleProps extends BlockNodeProps {
  "background-color"?: string;
  color?: string;
  content: string;
  "font-family"?: string;
  "font-size"?: string;
  "font-weight"?: string;
  padding?: string;
  "padding-bottom"?: string;
  "padding-left"?: string;
  "padding-right"?: string;
  "padding-top"?: string;
}
