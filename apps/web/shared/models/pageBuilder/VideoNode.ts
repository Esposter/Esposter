import type { VideoNodeProps } from "#shared/models/pageBuilder/VideoNodeProps";
import type { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import type { BlockNode } from "headless-block-editor";

// A Video node of a webpage: an uploaded video, loaded from an address
export type VideoNode = BlockNode<WebpageNodeType.Video, VideoNodeProps>;
