import type { CustomHtmlNodeProps } from "#shared/models/pageBuilder/CustomHtmlNodeProps";
import type { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import type { BlockNode } from "vue-block-editor-headless";

// A CustomHtml node of a webpage: raw HTML a page author wrote
export type CustomHtmlNode = BlockNode<WebpageNodeType.CustomHtml, CustomHtmlNodeProps>;
