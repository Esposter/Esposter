import type { MjmlCarouselProps } from "#src/models/MjmlCarouselProps";
import type { MjmlNodeType } from "#src/models/MjmlNodeType";
import type { BlockNode } from "headless-block-editor";

// A node of the MJML carousel type, holding the props its model declares
export type MjmlCarouselNode = BlockNode<MjmlNodeType.Carousel, MjmlCarouselProps>;
