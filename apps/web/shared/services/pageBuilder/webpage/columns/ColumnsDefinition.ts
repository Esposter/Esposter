import type { WebpageNodeTypeDefinition } from "#shared/models/pageBuilder/webpage/WebpageNodeTypeDefinition";

import { ElementAttribute } from "#shared/models/pageBuilder/html/ElementAttribute";
import { ElementTag } from "#shared/models/pageBuilder/html/ElementTag";
import { createColumnsPropsSchema } from "#shared/models/pageBuilder/webpage/ColumnsProps";
import { WebpageNodeType } from "#shared/models/pageBuilder/webpage/WebpageNodeType";
import { createPageNode } from "#shared/services/pageBuilder/createPageNode";
import { createElement } from "#shared/services/pageBuilder/html/createElement";
import { ColumnDefinition } from "#shared/services/pageBuilder/webpage/column/ColumnDefinition";
import {
  COLUMNS_CLASS,
  COLUMNS_CSS,
  DEFAULT_COLUMN_COUNT,
} from "#shared/services/pageBuilder/webpage/columns/constants";

export const ColumnsDefinition = {
  createProps: () => ({
    content: Array.from({ length: DEFAULT_COLUMN_COUNT }, () => createPageNode(ColumnDefinition)),
    style: {},
  }),
  createPropsSchema: createColumnsPropsSchema,
  css: COLUMNS_CSS,
  render: (_props, { content }) =>
    createElement(ElementTag.Division, { [ElementAttribute.Class]: COLUMNS_CLASS }, content),
  slots: { content: { allow: [WebpageNodeType.Column] } },
  type: WebpageNodeType.Columns,
} satisfies WebpageNodeTypeDefinition<WebpageNodeType.Columns>;
