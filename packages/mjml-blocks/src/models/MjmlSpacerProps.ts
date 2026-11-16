import type { BlockNodeProps } from "vue-block-editor-headless";

// The props an MJML spacer node holds: its attributes as MJML takes them
export interface MjmlSpacerProps extends BlockNodeProps {
  border?: string | undefined;
  "border-bottom"?: string | undefined;
  "border-left"?: string | undefined;
  "border-right"?: string | undefined;
  "border-top"?: string | undefined;
  "container-background-color"?: string | undefined;
  height?: string | undefined;
  padding?: string | undefined;
  "padding-bottom"?: string | undefined;
  "padding-left"?: string | undefined;
  "padding-right"?: string | undefined;
  "padding-top"?: string | undefined;
}
