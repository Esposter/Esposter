import type { MjmlCarouselImageProps } from "#src/models/MjmlCarouselImageProps";
import type { MjmlNodeType } from "#src/models/MjmlNodeType";
import type { BlockNode } from "headless-block-editor";

// A node of the MJML carousel image type, holding the props its model declares
export type MjmlCarouselImageNode = BlockNode<MjmlNodeType.CarouselImage, MjmlCarouselImageProps>;
