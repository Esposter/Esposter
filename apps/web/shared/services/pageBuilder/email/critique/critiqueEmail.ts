import type { CritiqueFinding } from "#shared/models/pageBuilder/CritiqueFinding";
import type { EmailCritiqueSources } from "#shared/models/pageBuilder/EmailCritiqueSources";
import type { emailDocumentSchema } from "#shared/services/pageBuilder/email/emailDocumentSchema";
import type { z } from "zod";

import { PAGE_BACKGROUND_COLOR } from "#shared/services/pageBuilder/critique/constants";
import { checkEmailHeadings } from "#shared/services/pageBuilder/email/critique/checkEmailHeadings";
import { critiqueEmailNodes } from "#shared/services/pageBuilder/email/critique/critiqueEmailNodes";
import { readEmailHeadings } from "#shared/services/pageBuilder/email/critique/readEmailHeadings";

// The critique of an email document: each button and navbar link, each text's contrast with the background its containers set,
// And each heading in document order. Every finding is a warning, since none of these checks stops a send
export const critiqueEmail = (
  document: z.output<typeof emailDocumentSchema>,
  sources: EmailCritiqueSources,
): CritiqueFinding[] => {
  const { attributes, body } = document.root.props;
  const bodyBackground = body?.["background-color"];
  const background = bodyBackground ? sources.readColor(bodyBackground) : PAGE_BACKGROUND_COLOR;

  return [
    ...critiqueEmailNodes(document.content, background, attributes, sources.readColor),
    ...checkEmailHeadings(readEmailHeadings(document.content)),
  ];
};
