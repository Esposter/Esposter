import type { EmailDocument } from "#shared/models/pageBuilder/email/EmailDocument";

import { DEFAULT_PAGE_LANG } from "#shared/services/pageBuilder/constants";
import { createPageNode } from "#shared/services/pageBuilder/createPageNode";
import { EmailButtonDefinition } from "#shared/services/pageBuilder/email/button/EmailButtonDefinition";
import { EmailColumnDefinition } from "#shared/services/pageBuilder/email/column/EmailColumnDefinition";
import { EmailSectionDefinition } from "#shared/services/pageBuilder/email/section/EmailSectionDefinition";
import { EmailTextDefinition } from "#shared/services/pageBuilder/email/text/EmailTextDefinition";
import { createTextContent } from "#shared/services/pageBuilder/text/createTextContent";

// A new email: one section of one column holding a line of text and a button, at MJML's own body width
export const createEmailDocument = (): EmailDocument => ({
  content: [
    createPageNode(EmailSectionDefinition, {
      content: [
        createPageNode(EmailColumnDefinition, {
          content: [
            createPageNode(EmailTextDefinition, { content: createTextContent("Hello") }),
            createPageNode(EmailButtonDefinition),
          ],
        }),
      ],
    }),
  ],
  root: { props: { backgroundColor: "", lang: DEFAULT_PAGE_LANG, previewText: "", width: "600px" } },
});
