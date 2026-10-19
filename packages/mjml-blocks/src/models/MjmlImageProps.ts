import type { BlockNodeProps } from "headless-block-editor";

// The props an MJML image node holds: its attributes as MJML takes them
export interface MjmlImageProps extends BlockNodeProps {
  align?: string;
  alt?: string;
  border?: string;
  "border-bottom"?: string;
  "border-left"?: string;
  "border-radius"?: string;
  "border-right"?: string;
  "border-top"?: string;
  "container-background-color"?: string;
  decorative?: boolean;
  "fluid-on-mobile"?: string;
  "font-size"?: string;
  height?: string;
  href?: string;
  "max-height"?: string;
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
  title?: string;
  usemap?: string;
  width?: string;
}
