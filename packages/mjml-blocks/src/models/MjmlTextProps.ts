import type { MjmlRichText } from "#src/models/MjmlRichText";
import type { BlockNodeProps } from "headless-block-editor";

// The props an MJML text node holds: its attributes as MJML takes them, its content
export interface MjmlTextProps extends BlockNodeProps {
  align?: string;
  "background-color"?: string;
  color?: string;
  "container-background-color"?: string;
  content: MjmlRichText;
  "font-family"?: string;
  "font-size"?: string;
  "font-style"?: string;
  "font-weight"?: string;
  height?: string;
  "letter-spacing"?: string;
  "line-height"?: string;
  padding?: string;
  "padding-bottom"?: string;
  "padding-left"?: string;
  "padding-right"?: string;
  "padding-top"?: string;
  "text-decoration"?: string;
  "text-transform"?: string;
  "vertical-align"?: string;
}
