import type { NodeTypeDefinition } from "#shared/models/pageBuilder/NodeTypeDefinition";
import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";

import { getWebpageStyleCss } from "#shared/services/pageBuilder/getWebpageStyleCss";

// The css of a page: each present type contributing its structural css once, in registry order, then the rules of its
// Styled nodes. The published render and the canvas both draw the page with it
export const getWebpageCss = (document: WebpageDocument, definitions: NodeTypeDefinition[]): string => {
  const structuralCss = definitions.map((definition) => definition.css).join("\n");

  return [structuralCss, getWebpageStyleCss(document)].filter((part) => part !== "").join("\n");
};
