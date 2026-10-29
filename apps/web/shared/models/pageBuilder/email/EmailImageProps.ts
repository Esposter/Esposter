import type { EmailAlign } from "#shared/models/pageBuilder/email/EmailAlign";
import type { PageNodeProps } from "#shared/models/pageBuilder/PageNodeProps";

import { emailAlignSchema } from "#shared/models/pageBuilder/email/EmailAlign";
import { pageNodePropsSchema } from "#shared/models/pageBuilder/PageNodeProps";
import { checkHasImageAlt } from "#shared/services/pageBuilder/checkHasImageAlt";
import { emailLengthSchema } from "#shared/services/pageBuilder/email/emailLengthSchema";
import { emailPaddingSchema } from "#shared/services/pageBuilder/email/emailPaddingSchema";
import { pageTextSchema } from "#shared/services/pageBuilder/pageTextSchema";
import { pageUrlSchema } from "#shared/services/pageBuilder/pageUrlSchema";
import { z } from "zod";

export interface EmailImageProps extends PageNodeProps {
  align: EmailAlign;
  alt: string;
  borderRadius: string;
  href: string;
  // An image that only decorates renders an empty alt, which is the only way to leave its alt empty
  isDecorative: boolean;
  padding: string;
  src: string;
  width: string;
}

export const emailImagePropsSchema = z
  .object({
    ...pageNodePropsSchema.shape,
    align: emailAlignSchema,
    alt: pageTextSchema,
    borderRadius: emailLengthSchema,
    href: pageUrlSchema,
    isDecorative: z.boolean(),
    padding: emailPaddingSchema,
    src: pageUrlSchema,
    width: emailLengthSchema,
  })
  .refine(checkHasImageAlt, {
    error: "An image needs its alt unless it only decorates",
    path: ["alt"],
  }) satisfies z.ZodType<EmailImageProps>;
