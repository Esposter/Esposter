import type { WebpageRootProps } from "#shared/models/pageBuilder/WebpageRootProps";
import type { BlockNode } from "headless-block-editor";

// The core's document shape, with the webpage's root props in place of the core's loose record
export interface WebpageDocument {
  content: BlockNode[];
  root: { props: WebpageRootProps };
}
