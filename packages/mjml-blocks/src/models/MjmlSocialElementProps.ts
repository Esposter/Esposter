import type { BlockNodeProps } from "vue-block-editor-headless";

// The props an MJML social element node holds: its attributes as MJML takes them, its content
export interface MjmlSocialElementProps extends BlockNodeProps {
  align?: string | undefined;
  alt?: string | undefined;
  "background-color"?: string | undefined;
  border?: string | undefined;
  "border-radius"?: string | undefined;
  color?: string | undefined;
  content: string;
  "font-family"?: string | undefined;
  "font-size"?: string | undefined;
  "font-style"?: string | undefined;
  "font-weight"?: string | undefined;
  href?: string | undefined;
  "icon-height"?: string | undefined;
  "icon-padding"?: string | undefined;
  "icon-position"?: string | undefined;
  "icon-size"?: string | undefined;
  "line-height"?: string | undefined;
  name?: string | undefined;
  padding?: string | undefined;
  "padding-bottom"?: string | undefined;
  "padding-left"?: string | undefined;
  "padding-right"?: string | undefined;
  "padding-top"?: string | undefined;
  rel?: string | undefined;
  sizes?: string | undefined;
  src?: string | undefined;
  srcset?: string | undefined;
  target?: string | undefined;
  "text-decoration"?: string | undefined;
  "text-padding"?: string | undefined;
  title?: string | undefined;
  "vertical-align"?: string | undefined;
}
