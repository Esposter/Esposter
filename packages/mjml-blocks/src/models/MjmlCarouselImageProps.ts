import type { BlockNodeProps } from "vue-block-editor-headless";

// The props an MJML carousel image node holds: its attributes as MJML takes them
export interface MjmlCarouselImageProps extends BlockNodeProps {
  alt?: string | undefined;
  "border-radius"?: string | undefined;
  decorative?: boolean | undefined;
  href?: string | undefined;
  rel?: string | undefined;
  src?: string | undefined;
  target?: string | undefined;
  "tb-border"?: string | undefined;
  "tb-border-radius"?: string | undefined;
  "thumbnails-src"?: string | undefined;
  title?: string | undefined;
}
