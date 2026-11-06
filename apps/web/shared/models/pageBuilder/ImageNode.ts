import type { ImageNodeProps } from "#shared/models/pageBuilder/ImageNodeProps";
import type { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import type { BlockNode } from "vue-block-editor-headless";

// An Image node of a webpage: a picture loaded from an address
export type ImageNode = BlockNode<WebpageNodeType.Image, ImageNodeProps>;
