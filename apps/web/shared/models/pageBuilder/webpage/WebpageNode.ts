import type { PageNode } from "#shared/models/pageBuilder/PageNode";
import type { WebpageNodePropsMap } from "#shared/models/pageBuilder/webpage/WebpageNodePropsMap";
import type { WebpageNodeType } from "#shared/models/pageBuilder/webpage/WebpageNodeType";

export type WebpageNode = { [TType in WebpageNodeType]: PageNode<TType, WebpageNodePropsMap[TType]> }[WebpageNodeType];
