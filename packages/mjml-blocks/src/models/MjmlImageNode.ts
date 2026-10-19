import type { MjmlImageProps } from "#src/models/MjmlImageProps";
import type { MjmlNodeType } from "#src/models/MjmlNodeType";
import type { BlockNode } from "headless-block-editor";

// A node of the MJML image type, holding the props its model declares
export type MjmlImageNode = BlockNode<MjmlNodeType.Image, MjmlImageProps>;
