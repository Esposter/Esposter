import type { WebpageKind } from "@/models/pageBuilder/WebpageKind";

import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { webpageDocumentSchema } from "#shared/services/pageBuilder/webpageDocumentSchema";
import { webpageNodeChildren } from "#shared/services/pageBuilder/webpageNodeChildren";
import { webpageNodeSchema } from "#shared/services/pageBuilder/webpageNodeSchema";
import { webpageRegistry } from "#shared/services/pageBuilder/webpageRegistry";
import { PageBuilderEditor } from "@/models/pageBuilder/PageBuilderEditor";
import { webpageRootFormSchema } from "@/models/pageBuilder/WebpageRootForm";
import {
  WEBPAGE_NODE_TYPE_ICON_MAP,
  WEBPAGE_NODE_TYPE_TITLE_MAP,
  WEBPAGE_PALETTE_CATEGORIES,
} from "@/services/pageBuilder/constants";
import { createWebpageNode } from "@/services/pageBuilder/webpageNodeDefaults";

export const webpageKind: WebpageKind = {
  children: webpageNodeChildren,
  createNode: createWebpageNode,
  documentSchema: webpageDocumentSchema,
  editor: PageBuilderEditor.Webpage,
  icons: WEBPAGE_NODE_TYPE_ICON_MAP,
  nodeSchema: webpageNodeSchema,
  paletteCategories: WEBPAGE_PALETTE_CATEGORIES,
  registry: webpageRegistry,
  rootFormSchema: webpageRootFormSchema,
  textType: WebpageNodeType.Text,
  titles: WEBPAGE_NODE_TYPE_TITLE_MAP,
};
