import type { MjmlRichText } from "#src/models/MjmlRichText";
import type { BlockNodeProps } from "vue-block-editor-headless";

// The props an MJML text node holds: its attributes as MJML takes them, its content
export interface MjmlTextProps extends BlockNodeProps {
  align?: string | undefined;
  "background-color"?: string | undefined;
  color?: string | undefined;
  "container-background-color"?: string | undefined;
  content: MjmlRichText;
  "font-family"?: string | undefined;
  "font-size"?: string | undefined;
  "font-style"?: string | undefined;
  "font-weight"?: string | undefined;
  height?: string | undefined;
  "letter-spacing"?: string | undefined;
  "line-height"?: string | undefined;
  padding?: string | undefined;
  "padding-bottom"?: string | undefined;
  "padding-left"?: string | undefined;
  "padding-right"?: string | undefined;
  "padding-top"?: string | undefined;
  "text-decoration"?: string | undefined;
  "text-transform"?: string | undefined;
  "vertical-align"?: string | undefined;
}
