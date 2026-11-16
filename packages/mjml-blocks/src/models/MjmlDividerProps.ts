import type { BlockNodeProps } from "vue-block-editor-headless";

// The props an MJML divider node holds: its attributes as MJML takes them
export interface MjmlDividerProps extends BlockNodeProps {
  align?: string | undefined;
  "border-color"?: string | undefined;
  "border-style"?: string | undefined;
  "border-width"?: string | undefined;
  "container-background-color"?: string | undefined;
  padding?: string | undefined;
  "padding-bottom"?: string | undefined;
  "padding-left"?: string | undefined;
  "padding-right"?: string | undefined;
  "padding-top"?: string | undefined;
  width?: string | undefined;
}
