import type { BlockNodeProps } from "headless-block-editor";

// The props an MJML divider node holds: its attributes as MJML takes them
export interface MjmlDividerProps extends BlockNodeProps {
  align?: string;
  "border-color"?: string;
  "border-style"?: string;
  "border-width"?: string;
  "container-background-color"?: string;
  padding?: string;
  "padding-bottom"?: string;
  "padding-left"?: string;
  "padding-right"?: string;
  "padding-top"?: string;
  width?: string;
}
