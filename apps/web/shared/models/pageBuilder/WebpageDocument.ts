import type { WebpageRootProps } from "#shared/models/pageBuilder/WebpageRootProps";
import type { BlockDocument } from "headless-block-editor";

// The core's document with the webpage's root props, the type the webpage's document schema parses to
export type WebpageDocument = BlockDocument<WebpageRootProps>;
