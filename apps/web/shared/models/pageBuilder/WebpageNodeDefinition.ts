import type { WebpageNode } from "#shared/models/pageBuilder/WebpageNode";
import type { WebpageNodeDefinitionMap } from "#shared/models/pageBuilder/WebpageNodeDefinitionMap";

// The definition of any webpage node type: the union of the map's per-type definitions
export type WebpageNodeDefinition = WebpageNodeDefinitionMap[WebpageNode["type"]];
