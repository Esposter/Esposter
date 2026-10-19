import type { BlockNodeProps } from "headless-block-editor";

// The props an MJML social element node holds: its attributes as MJML takes them, its content
export interface MjmlSocialElementProps extends BlockNodeProps {
  align?: string;
  alt?: string;
  "background-color"?: string;
  border?: string;
  "border-radius"?: string;
  color?: string;
  content: string;
  "font-family"?: string;
  "font-size"?: string;
  "font-style"?: string;
  "font-weight"?: string;
  href?: string;
  "icon-height"?: string;
  "icon-padding"?: string;
  "icon-position"?: string;
  "icon-size"?: string;
  "line-height"?: string;
  name?: string;
  padding?: string;
  "padding-bottom"?: string;
  "padding-left"?: string;
  "padding-right"?: string;
  "padding-top"?: string;
  rel?: string;
  sizes?: string;
  src?: string;
  srcset?: string;
  target?: string;
  "text-decoration"?: string;
  "text-padding"?: string;
  title?: string;
  "vertical-align"?: string;
}
