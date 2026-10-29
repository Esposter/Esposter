import type { WebpageNodeTypeDefinition } from "#shared/models/pageBuilder/webpage/WebpageNodeTypeDefinition";

import { ElementTag } from "#shared/models/pageBuilder/html/ElementTag";
import { customHtmlPropsSchema } from "#shared/models/pageBuilder/webpage/CustomHtmlProps";
import { WebpageNodeType } from "#shared/models/pageBuilder/webpage/WebpageNodeType";
import { createElement } from "#shared/services/pageBuilder/html/createElement";
import { createRaw } from "#shared/services/pageBuilder/html/createRaw";

export const CustomHtmlDefinition = {
  createProps: () => ({ html: "", style: {} }),
  createPropsSchema: () => customHtmlPropsSchema,
  render: ({ html }) => createElement(ElementTag.Division, {}, html ? [createRaw(html)] : []),
  slots: {},
  type: WebpageNodeType.CustomHtml,
} satisfies WebpageNodeTypeDefinition<WebpageNodeType.CustomHtml>;
