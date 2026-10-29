import type { EmailSectionLayout } from "#shared/models/pageBuilder/email/EmailSectionLayout";

import { EmailAlign } from "#shared/models/pageBuilder/email/EmailAlign";

export const createEmailSectionLayout = (): EmailSectionLayout => ({
  backgroundColor: "",
  backgroundUrl: "",
  isFullWidth: false,
  padding: "20px 0",
  textAlign: EmailAlign.Center,
});
