import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";
import type { WebpageNodeDefinition } from "#shared/models/pageBuilder/WebpageNodeDefinition";
import type { WebpageRootProps } from "#shared/models/pageBuilder/WebpageRootProps";

import { getWebpageStyleCss } from "#shared/services/pageBuilder/getWebpageStyleCss";

// The page's colour tokens as custom properties on the root, which a node's style names rather than copying their value
const getTokenCss = (tokens: WebpageRootProps["tokens"]): string => {
  const declarations = Object.entries(tokens).map(([name, value]) => `  --${name}: ${value};`);
  return declarations.length === 0 ? "" : `:root {\n${declarations.join("\n")}\n}`;
};

// The css of a page: its tokens, then each present type contributing its structural css once, in registry order, then
// The rules of its styled nodes. The published render and the canvas both draw the page with it
export const getWebpageCss = (document: WebpageDocument, definitions: WebpageNodeDefinition[]): string => {
  const tokenCss = getTokenCss(document.root.props.tokens);
  const structuralCss = definitions.map((definition) => definition.css).join("\n");

  return [tokenCss, structuralCss, getWebpageStyleCss(document)].filter((part) => part !== "").join("\n");
};
