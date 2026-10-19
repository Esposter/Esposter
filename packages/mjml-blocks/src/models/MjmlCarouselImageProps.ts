import type { BlockNodeProps } from "headless-block-editor";

// The props an MJML carousel image node holds: its attributes as MJML takes them
export interface MjmlCarouselImageProps extends BlockNodeProps {
  alt?: string;
  "border-radius"?: string;
  decorative?: boolean;
  href?: string;
  rel?: string;
  src?: string;
  target?: string;
  "tb-border"?: string;
  "tb-border-radius"?: string;
  "thumbnails-src"?: string;
  title?: string;
}
