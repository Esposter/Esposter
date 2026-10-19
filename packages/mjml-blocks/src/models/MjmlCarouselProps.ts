import type { MjmlCarouselImageNode } from "#src/models/MjmlCarouselImageNode";
import type { BlockNodeProps } from "headless-block-editor";

// The props an MJML carousel node holds: its attributes as MJML takes them, its children
export interface MjmlCarouselProps extends BlockNodeProps {
  align?: string;
  "border-radius"?: string;
  children: MjmlCarouselImageNode[];
  "container-background-color"?: string;
  "icon-width"?: string;
  "left-icon"?: string;
  padding?: string;
  "padding-bottom"?: string;
  "padding-left"?: string;
  "padding-right"?: string;
  "padding-top"?: string;
  "right-icon"?: string;
  "tb-border"?: string;
  "tb-border-radius"?: string;
  "tb-hover-border-color"?: string;
  "tb-selected-border-color"?: string;
  "tb-width"?: string;
  thumbnails?: string;
}
