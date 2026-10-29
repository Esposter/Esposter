import type { HtmlElementNode } from "#shared/models/pageBuilder/html/HtmlElementNode";
import type { RenderContext } from "#shared/models/pageBuilder/RenderContext";
import type { WebpageNode } from "#shared/models/pageBuilder/webpage/WebpageNode";

import { ElementAttribute } from "#shared/models/pageBuilder/html/ElementAttribute";
import { getNodeClass } from "#shared/services/pageBuilder/getNodeClass";
import { renderPageNode } from "#shared/services/pageBuilder/renderPageNode";
import { checkHasNodeStyle } from "#shared/services/pageBuilder/webpage/checkHasNodeStyle";
import { WebpageNodeTypeMap } from "#shared/services/pageBuilder/webpage/WebpageNodeTypeMap";

// A styled node's element carries the class its rules select, beside any class its type gave it
export const renderWebpageNode = (node: WebpageNode, context: RenderContext): HtmlElementNode =>
  renderPageNode(WebpageNodeTypeMap, node, context, (element, { props: { id, style } }) =>
    checkHasNodeStyle(style)
      ? {
          ...element,
          attributes: {
            ...element.attributes,
            [ElementAttribute.Class]: [element.attributes[ElementAttribute.Class], getNodeClass(id)]
              .filter(Boolean)
              .join(" "),
          },
        }
      : element,
  );
