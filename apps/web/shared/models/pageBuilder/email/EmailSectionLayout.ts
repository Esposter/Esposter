import type { EmailAlign } from "#shared/models/pageBuilder/email/EmailAlign";

import { emailAlignSchema } from "#shared/models/pageBuilder/email/EmailAlign";
import { emailColorSchema } from "#shared/services/pageBuilder/email/emailColorSchema";
import { emailPaddingSchema } from "#shared/services/pageBuilder/email/emailPaddingSchema";
import { pageUrlSchema } from "#shared/services/pageBuilder/pageUrlSchema";
import { z } from "zod";

// What a section and a wrapper share: the band's background, its padding and how its content aligns
export interface EmailSectionLayout {
  backgroundColor: string;
  backgroundUrl: string;
  isFullWidth: boolean;
  padding: string;
  textAlign: EmailAlign;
}

export const emailSectionLayoutSchema = z.object({
  backgroundColor: emailColorSchema,
  backgroundUrl: pageUrlSchema,
  isFullWidth: z.boolean(),
  padding: emailPaddingSchema,
  textAlign: emailAlignSchema,
}) satisfies z.ZodType<EmailSectionLayout>;
