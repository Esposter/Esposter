import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";

import { getNodeStyleCss } from "#shared/services/pageBuilder/getNodeStyleCss";
import { webpageNodeChildren } from "#shared/services/pageBuilder/webpageNodeChildren";
import { webpageRegistry } from "#shared/services/pageBuilder/webpageRegistry";
import { renderBlockNodes } from "headless-block-editor";

// The rules of every styled node in the document, each node's before its children's, as the document reads
export const getWebpageStyleCss = (document: WebpageDocument): string =>
  renderBlockNodes(document.content, webpageRegistry, webpageNodeChildren, (node, definition, slots) =>
    [getNodeStyleCss(node, definition), ...Object.values(slots).flat()].filter((css) => css !== "").join("\n"),
  )
    .filter((css) => css !== "")
    .join("\n");
