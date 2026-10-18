import type { NodeTypeDefinition } from "#shared/models/pageBuilder/NodeTypeDefinition";
import type { BlockRegistry } from "headless-block-editor";

import { webpageRootPropsSchema } from "#shared/models/pageBuilder/WebpageRootProps";
import { WEBPAGE_PLACEABLE_NODE_TYPES } from "#shared/services/pageBuilder/constants";
import { webpageNodeTypeDefinitionMap } from "#shared/services/pageBuilder/webpageNodeTypeDefinitionMap";

// The webpage's registry: the root takes any placeable type and a language, and every type is in its list
export const webpageRegistry = {
  root: { content: WEBPAGE_PLACEABLE_NODE_TYPES, propsSchema: webpageRootPropsSchema },
  types: Object.values(webpageNodeTypeDefinitionMap),
} satisfies BlockRegistry<NodeTypeDefinition>;
