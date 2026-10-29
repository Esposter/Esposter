import type { WebpageNodeTypeDefinition } from "#shared/models/pageBuilder/webpage/WebpageNodeTypeDefinition";

import { ElementTag } from "#shared/models/pageBuilder/html/ElementTag";
import { createSectionPropsSchema } from "#shared/models/pageBuilder/webpage/SectionProps";
import { WebpageNodeType } from "#shared/models/pageBuilder/webpage/WebpageNodeType";
import { createElement } from "#shared/services/pageBuilder/html/createElement";
import { WEBPAGE_CONTENT_NODE_TYPES } from "#shared/services/pageBuilder/webpage/constants";

export const SectionDefinition = {
  createProps: () => ({ content: [], style: {}, tag: ElementTag.Section }),
  createPropsSchema: createSectionPropsSchema,
  render: ({ tag }, { content }) => createElement(tag, {}, content),
  slots: { content: { allow: WEBPAGE_CONTENT_NODE_TYPES } },
  type: WebpageNodeType.Section,
} satisfies WebpageNodeTypeDefinition<WebpageNodeType.Section>;
