import type { BlockNodeProps } from "headless-block-editor";

// The props an MJML button node holds: its attributes as MJML takes them, its content
export interface MjmlButtonProps extends BlockNodeProps {
  align?: string;
  "background-color"?: string;
  border?: string;
  "border-bottom"?: string;
  "border-left"?: string;
  "border-radius"?: string;
  "border-right"?: string;
  "border-top"?: string;
  color?: string;
  "container-background-color"?: string;
  content: string;
  "font-family"?: string;
  "font-size"?: string;
  "font-style"?: string;
  "font-weight"?: string;
  height?: string;
  href?: string;
  "inner-padding"?: string;
  "letter-spacing"?: string;
  "line-height"?: string;
  name?: string;
  padding?: string;
  "padding-bottom"?: string;
  "padding-left"?: string;
  "padding-right"?: string;
  "padding-top"?: string;
  rel?: string;
  target?: string;
  "text-align"?: string;
  "text-decoration"?: string;
  "text-transform"?: string;
  title?: string;
  "vertical-align"?: string;
  width?: string;
}
