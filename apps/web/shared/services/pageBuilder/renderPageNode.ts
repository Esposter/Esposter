import type { HtmlElementNode } from "#shared/models/pageBuilder/html/HtmlElementNode";
import type { HtmlNode } from "#shared/models/pageBuilder/html/HtmlNode";
import type { PageNode } from "#shared/models/pageBuilder/PageNode";
import type { PageNodeDefinitionMap } from "#shared/models/pageBuilder/PageNodeDefinitionMap";
import type { RenderContext } from "#shared/models/pageBuilder/RenderContext";
import type { SlotKey } from "#shared/models/pageBuilder/SlotKey";

import { getNodeTypeDefinition } from "#shared/services/pageBuilder/getNodeTypeDefinition";

// Renders a node's slots first, then the node over them, and lets the editor's own step add what every node of it
// Carries, as a webpage's styled node carries its class
export const renderPageNode = <TNode extends PageNode>(
  definitionMap: PageNodeDefinitionMap<TNode>,
  node: TNode,
  context: RenderContext,
  decorate: (element: HtmlElementNode, node: TNode) => HtmlElementNode = (element) => element,
): HtmlElementNode => {
  const definition = getNodeTypeDefinition(definitionMap, node);
  // The keys are the definition's own slot keys, which a generic node's props cannot name
  const slots = Object.fromEntries(
    Object.keys(definition.slots).map((slotKey) => [
      slotKey,
      (Reflect.get(node.props, slotKey) as TNode[]).map((child) =>
        renderPageNode(definitionMap, child, context, decorate),
      ),
    ]),
  ) as Record<SlotKey<TNode["props"], TNode>, HtmlNode[]>;
  return decorate(definition.render(node.props, slots, context), node);
};
