import type { BlockNodeProps } from "vue-block-editor-headless";

// The props an MJML image node holds: its attributes as MJML takes them
export interface MjmlImageProps extends BlockNodeProps {
  align?: string | undefined;
  alt?: string | undefined;
  border?: string | undefined;
  "border-bottom"?: string | undefined;
  "border-left"?: string | undefined;
  "border-radius"?: string | undefined;
  "border-right"?: string | undefined;
  "border-top"?: string | undefined;
  "container-background-color"?: string | undefined;
  decorative?: boolean | undefined;
  "fluid-on-mobile"?: string | undefined;
  "font-size"?: string | undefined;
  height?: string | undefined;
  href?: string | undefined;
  "max-height"?: string | undefined;
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
  title?: string | undefined;
  usemap?: string | undefined;
  width?: string | undefined;
}
