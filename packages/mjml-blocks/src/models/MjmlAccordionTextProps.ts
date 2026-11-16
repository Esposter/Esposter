import type { MjmlRichText } from "#src/models/MjmlRichText";
import type { BlockNodeProps } from "vue-block-editor-headless";

// The props an MJML accordion text node holds: its attributes as MJML takes them, its content
export interface MjmlAccordionTextProps extends BlockNodeProps {
  "background-color"?: string | undefined;
  color?: string | undefined;
  content: MjmlRichText;
  "font-family"?: string | undefined;
  "font-size"?: string | undefined;
  "font-weight"?: string | undefined;
  "letter-spacing"?: string | undefined;
  "line-height"?: string | undefined;
  padding?: string | undefined;
  "padding-bottom"?: string | undefined;
  "padding-left"?: string | undefined;
  "padding-right"?: string | undefined;
  "padding-top"?: string | undefined;
}
