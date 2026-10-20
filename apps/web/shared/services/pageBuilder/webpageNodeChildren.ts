import type { WebpageNode } from "#shared/models/pageBuilder/WebpageNode";
import type { BlockChildren } from "headless-block-editor";

import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { exhaustiveGuard } from "@esposter/shared";

// The children port of a webpage: each node type's slots as the typed list of nodes that slot holds, switched on the type tag
export const webpageNodeChildren = (node: WebpageNode): ReturnType<BlockChildren<WebpageNode>> => {
  switch (node.type) {
    case WebpageNodeType.Button:
    case WebpageNodeType.Countdown:
    case WebpageNodeType.CustomHtml:
    case WebpageNodeType.Image:
    case WebpageNodeType.SurveyInvite:
    case WebpageNodeType.Text:
    case WebpageNodeType.Tooltip:
    case WebpageNodeType.TypedText:
    case WebpageNodeType.Video:
      return {};
    case WebpageNodeType.Column:
    case WebpageNodeType.Columns:
    case WebpageNodeType.Section:
    case WebpageNodeType.Tab:
    case WebpageNodeType.Tabs:
      return { children: node.props.children };
    default:
      return exhaustiveGuard(node);
  }
};
