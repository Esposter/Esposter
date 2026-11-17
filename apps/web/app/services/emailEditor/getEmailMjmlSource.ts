import type { EmailDocument } from "#src/models/pageBuilder/EmailDocument";

import { emailRegistry } from "#shared/services/pageBuilder/email/emailRegistry";
import { renderMjmlDocument, serializeMjml } from "mjml-blocks";

// The saved document's MJML source, the text the package reads back into the same email
export const getEmailMjmlSource = (document: EmailDocument): string =>
  serializeMjml(
    renderMjmlDocument(document, emailRegistry, { context: { origin: window.location.origin }, isStampingIds: false }),
  );
