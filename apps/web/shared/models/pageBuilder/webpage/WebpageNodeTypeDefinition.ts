import type { NodeTypeDefinition } from "#shared/models/pageBuilder/NodeTypeDefinition";
import type { WebpageNode } from "#shared/models/pageBuilder/webpage/WebpageNode";
import type { WebpageNodePropsMap } from "#shared/models/pageBuilder/webpage/WebpageNodePropsMap";
import type { WebpageNodeType } from "#shared/models/pageBuilder/webpage/WebpageNodeType";

export type WebpageNodeTypeDefinition<TType extends WebpageNodeType> = NodeTypeDefinition<
  WebpageNode,
  TType,
  WebpageNodePropsMap[TType]
>;
