import type { WebpageNodeTypeDefinition } from "#shared/models/pageBuilder/webpage/WebpageNodeTypeDefinition";

import { ElementAttribute } from "#shared/models/pageBuilder/html/ElementAttribute";
import { ElementTag } from "#shared/models/pageBuilder/html/ElementTag";
import { createColumnPropsSchema } from "#shared/models/pageBuilder/webpage/ColumnProps";
import { WebpageNodeType } from "#shared/models/pageBuilder/webpage/WebpageNodeType";
import { createElement } from "#shared/services/pageBuilder/html/createElement";
import { COLUMN_CLASS, COLUMN_CSS } from "#shared/services/pageBuilder/webpage/column/constants";
import { WEBPAGE_CONTENT_NODE_TYPES } from "#shared/services/pageBuilder/webpage/constants";

export const ColumnDefinition = {
  createProps: () => ({ content: [], style: {} }),
  createPropsSchema: createColumnPropsSchema,
  css: COLUMN_CSS,
  render: (_props, { content }) =>
    createElement(ElementTag.Division, { [ElementAttribute.Class]: COLUMN_CLASS }, content),
  slots: { content: { allow: WEBPAGE_CONTENT_NODE_TYPES } },
  type: WebpageNodeType.Column,
} satisfies WebpageNodeTypeDefinition<WebpageNodeType.Column>;
