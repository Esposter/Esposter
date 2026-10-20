import type { MjmlRichText } from "#src/models/MjmlRichText";
import type { BlockNodeProps } from "headless-block-editor";

// The props an MJML accordion text node holds: its attributes as MJML takes them, its content
export interface MjmlAccordionTextProps extends BlockNodeProps {
  "background-color"?: string;
  color?: string;
  content: MjmlRichText;
  "font-family"?: string;
  "font-size"?: string;
  "font-weight"?: string;
  "letter-spacing"?: string;
  "line-height"?: string;
  padding?: string;
  "padding-bottom"?: string;
  "padding-left"?: string;
  "padding-right"?: string;
  "padding-top"?: string;
}
