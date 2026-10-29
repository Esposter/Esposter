import { emailColorSchema } from "#shared/services/pageBuilder/email/emailColorSchema";
import { emailLengthSchema } from "#shared/services/pageBuilder/email/emailLengthSchema";
import { pageLangSchema } from "#shared/services/pageBuilder/pageLangSchema";
import { pageTextSchema } from "#shared/services/pageBuilder/pageTextSchema";
import { z } from "zod";

export interface EmailRootProps {
  backgroundColor: string;
  lang: string;
  // The line an inbox shows beside the subject, emitted as the email's mj-preview
  previewText: string;
  width: string;
}

export const emailRootPropsSchema = z.object({
  backgroundColor: emailColorSchema,
  lang: pageLangSchema,
  previewText: pageTextSchema,
  width: emailLengthSchema,
}) satisfies z.ZodType<EmailRootProps>;
