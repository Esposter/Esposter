import type { MjmlCarouselImageNode } from "#src/models/MjmlCarouselImageNode";
import type { BlockNodeProps } from "vue-block-editor-headless";

// The props an MJML carousel node holds: its attributes as MJML takes them, its children
export interface MjmlCarouselProps extends BlockNodeProps {
  align?: string | undefined;
  "border-radius"?: string | undefined;
  children: MjmlCarouselImageNode[];
  "container-background-color"?: string | undefined;
  "icon-width"?: string | undefined;
  "left-icon"?: string | undefined;
  padding?: string | undefined;
  "padding-bottom"?: string | undefined;
  "padding-left"?: string | undefined;
  "padding-right"?: string | undefined;
  "padding-top"?: string | undefined;
  "right-icon"?: string | undefined;
  "tb-border"?: string | undefined;
  "tb-border-radius"?: string | undefined;
  "tb-hover-border-color"?: string | undefined;
  "tb-selected-border-color"?: string | undefined;
  "tb-width"?: string | undefined;
  thumbnails?: string | undefined;
}
