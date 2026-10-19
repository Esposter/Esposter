import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";

import { getWebpageStyleCss } from "#shared/services/pageBuilder/getWebpageStyleCss";
import { webpageNodeTypeDefinitionMap } from "#shared/services/pageBuilder/webpageNodeTypeDefinitionMap";
import { webpageRegistry } from "#shared/services/pageBuilder/webpageRegistry";
import { renderBlockNodes } from "headless-block-editor";

// The css of a page: each type the document holds contributing its structural css once, in registry order, then the
// Rules of its styled nodes. The published render and the canvas both draw the page with it
export const getWebpageCss = (document: WebpageDocument): string => {
  const presentTypes = new Set<string>();
  renderBlockNodes(document.content, webpageRegistry, (_node, definition) => {
    presentTypes.add(definition.type);
    return "";
  });
  const structuralCss = Object.values(webpageNodeTypeDefinitionMap)
    .filter((definition) => presentTypes.has(definition.type))
    .map((definition) => definition.css)
    .join("\n");

  return [structuralCss, getWebpageStyleCss(document)].filter((part) => part !== "").join("\n");
};
