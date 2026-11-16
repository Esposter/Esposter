import type { BlockNodeProps } from "vue-block-editor-headless";

// The props an MJML button node holds: its attributes as MJML takes them, its content
export interface MjmlButtonProps extends BlockNodeProps {
  align?: string | undefined;
  "background-color"?: string | undefined;
  border?: string | undefined;
  "border-bottom"?: string | undefined;
  "border-left"?: string | undefined;
  "border-radius"?: string | undefined;
  "border-right"?: string | undefined;
  "border-top"?: string | undefined;
  color?: string | undefined;
  "container-background-color"?: string | undefined;
  content: string;
  "font-family"?: string | undefined;
  "font-size"?: string | undefined;
  "font-style"?: string | undefined;
  "font-weight"?: string | undefined;
  height?: string | undefined;
  href?: string | undefined;
  "inner-padding"?: string | undefined;
  "letter-spacing"?: string | undefined;
  "line-height"?: string | undefined;
  name?: string | undefined;
  padding?: string | undefined;
  "padding-bottom"?: string | undefined;
  "padding-left"?: string | undefined;
  "padding-right"?: string | undefined;
  "padding-top"?: string | undefined;
  rel?: string | undefined;
  target?: string | undefined;
  "text-align"?: string | undefined;
  "text-decoration"?: string | undefined;
  "text-transform"?: string | undefined;
  title?: string | undefined;
  "vertical-align"?: string | undefined;
  width?: string | undefined;
}
