import type { NodeTypeDefinition } from "#shared/models/pageBuilder/NodeTypeDefinition";
import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";

import { webpageNodeTypeDefinitionMap } from "#shared/services/pageBuilder/webpageNodeTypeDefinitionMap";
import { webpageRegistry } from "#shared/services/pageBuilder/webpageRegistry";
import { renderBlockNodes } from "headless-block-editor";

// The definitions of the types a document holds, in registry order, so each type's css and script is written once
export const getPresentDefinitions = (document: WebpageDocument): NodeTypeDefinition[] => {
  const presentTypes = new Set<string>();
  renderBlockNodes(document.content, webpageRegistry, (_node, definition) => {
    presentTypes.add(definition.type);
    return "";
  });

  return Object.values(webpageNodeTypeDefinitionMap).filter((definition) => presentTypes.has(definition.type));
};
