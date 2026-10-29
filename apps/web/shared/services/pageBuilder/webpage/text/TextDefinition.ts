import type { WebpageNodeTypeDefinition } from "#shared/models/pageBuilder/webpage/WebpageNodeTypeDefinition";

import { ElementTag } from "#shared/models/pageBuilder/html/ElementTag";
import { textPropsSchema } from "#shared/models/pageBuilder/webpage/TextProps";
import { WebpageNodeType } from "#shared/models/pageBuilder/webpage/WebpageNodeType";
import { createElement } from "#shared/services/pageBuilder/html/createElement";
import { TEXT_SCHEMA } from "#shared/services/pageBuilder/text/constants";
import { createTextContent } from "#shared/services/pageBuilder/text/createTextContent";
import { renderTextContent } from "#shared/services/pageBuilder/text/renderTextContent";

export const TextDefinition = {
  createProps: () => ({ content: createTextContent(), style: {} }),
  createPropsSchema: () => textPropsSchema,
  render: ({ content }) => createElement(ElementTag.Division, {}, renderTextContent(content, TEXT_SCHEMA)),
  slots: {},
  type: WebpageNodeType.Text,
} satisfies WebpageNodeTypeDefinition<WebpageNodeType.Text>;
