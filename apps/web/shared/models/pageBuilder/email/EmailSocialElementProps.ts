import type { EmailSocialNetwork } from "#shared/models/pageBuilder/email/EmailSocialNetwork";
import type { PageNodeProps } from "#shared/models/pageBuilder/PageNodeProps";

import { emailSocialNetworkSchema } from "#shared/models/pageBuilder/email/EmailSocialNetwork";
import { pageNodePropsSchema } from "#shared/models/pageBuilder/PageNodeProps";
import { pageTextSchema } from "#shared/services/pageBuilder/pageTextSchema";
import { pageUrlSchema } from "#shared/services/pageBuilder/pageUrlSchema";
import { z } from "zod";

// One network's icon, linking to the profile its href names
export interface EmailSocialElementProps extends PageNodeProps {
  href: string;
  label: string;
  network: EmailSocialNetwork;
}

export const emailSocialElementPropsSchema = z.object({
  ...pageNodePropsSchema.shape,
  href: pageUrlSchema,
  label: pageTextSchema,
  network: emailSocialNetworkSchema,
}) satisfies z.ZodType<EmailSocialElementProps>;
