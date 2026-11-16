import type { BlockNodeProps } from "vue-block-editor-headless";

// The props an MJML accordion title node holds: its attributes as MJML takes them, its content
export interface MjmlAccordionTitleProps extends BlockNodeProps {
  "background-color"?: string | undefined;
  color?: string | undefined;
  content: string;
  "font-family"?: string | undefined;
  "font-size"?: string | undefined;
  "font-weight"?: string | undefined;
  padding?: string | undefined;
  "padding-bottom"?: string | undefined;
  "padding-left"?: string | undefined;
  "padding-right"?: string | undefined;
  "padding-top"?: string | undefined;
}
