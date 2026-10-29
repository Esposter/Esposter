import type { WebpageDocument } from "#shared/models/pageBuilder/webpage/WebpageDocument";

import { ElementTag } from "#shared/models/pageBuilder/html/ElementTag";
import { DEFAULT_PAGE_LANG } from "#shared/services/pageBuilder/constants";
import { createPageNode } from "#shared/services/pageBuilder/createPageNode";
import { createTextContent } from "#shared/services/pageBuilder/text/createTextContent";
import { ButtonDefinition } from "#shared/services/pageBuilder/webpage/button/ButtonDefinition";
import { SectionDefinition } from "#shared/services/pageBuilder/webpage/section/SectionDefinition";
import { TextDefinition } from "#shared/services/pageBuilder/webpage/text/TextDefinition";

// A new webpage: one section holding a line of text and a button, so the page opens with something to select
export const createWebpageDocument = (): WebpageDocument => ({
  content: [
    createPageNode(SectionDefinition, {
      content: [
        createPageNode(TextDefinition, { content: createTextContent("Welcome") }),
        createPageNode(ButtonDefinition),
      ],
      tag: ElementTag.Main,
    }),
  ],
  root: { props: { lang: DEFAULT_PAGE_LANG, title: "", tokens: { colors: {}, fonts: {} } } },
});
