import type { WebpageNode } from "#shared/models/pageBuilder/WebpageNode";
import type { WebpageRootProps } from "#shared/models/pageBuilder/WebpageRootProps";
import type { BlockDocument } from "headless-block-editor";

// The core's document of a webpage: its nodes and the root props its document declares
export type WebpageDocument = BlockDocument<WebpageNode, WebpageRootProps>;
