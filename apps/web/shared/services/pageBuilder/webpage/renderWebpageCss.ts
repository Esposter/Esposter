import type { PageTokens } from "#shared/models/pageBuilder/style/PageTokens";
import type { WebpageNode } from "#shared/models/pageBuilder/webpage/WebpageNode";

import { Breakpoint } from "#shared/models/pageBuilder/style/Breakpoint";
import { getMediaQueryCss } from "#shared/services/pageBuilder/style/getMediaQueryCss";
import { getNodeStyleCss } from "#shared/services/pageBuilder/style/getNodeStyleCss";
import { getPageTokensCss } from "#shared/services/pageBuilder/style/getPageTokensCss";
import { PAGE_BASE_CSS } from "#shared/services/pageBuilder/webpage/constants";
import { getWebpageNodeTypeDefinitions } from "#shared/services/pageBuilder/webpage/getWebpageNodeTypeDefinitions";

// The page's one stylesheet: the reset, the tokens, each present type's structural CSS, then every styled node's rules —
// Desktop, then each narrower breakpoint's media query, so a narrower override wins
export const renderWebpageCss = (tokens: PageTokens, nodes: WebpageNode[]) => {
  const getBreakpointCss = (breakpoint: Breakpoint) =>
    nodes.map(({ props: { id, style } }) => getNodeStyleCss(id, style, breakpoint)).join("");
  return [
    PAGE_BASE_CSS,
    getPageTokensCss(tokens),
    ...getWebpageNodeTypeDefinitions(nodes).map((definition) => ("css" in definition ? definition.css : "")),
    getBreakpointCss(Breakpoint.Desktop),
    getMediaQueryCss(Breakpoint.Tablet, getBreakpointCss(Breakpoint.Tablet)),
    getMediaQueryCss(Breakpoint.Mobile, getBreakpointCss(Breakpoint.Mobile)),
  ].join("");
};
