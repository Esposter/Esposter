import type { PageNodeProps } from "#shared/models/pageBuilder/PageNodeProps";

import { pageNodePropsSchema } from "#shared/models/pageBuilder/PageNodeProps";
import { pageTextSchema } from "#shared/services/pageBuilder/pageTextSchema";
import { createResourceLinkSchema } from "#shared/services/resource/link/createResourceLinkSchema";
import { ResourceLinkType } from "@esposter/db-schema";
import { z } from "zod";

// A link to a published survey, declared as a resource link so the survey's delete warning names this email
export interface EmailSurveyInviteProps extends PageNodeProps {
  label: string;
  surveyId: string;
}

export const emailSurveyInvitePropsSchema = z.object({
  ...pageNodePropsSchema.shape,
  label: pageTextSchema.min(1),
  surveyId: createResourceLinkSchema(ResourceLinkType.Survey),
}) satisfies z.ZodType<EmailSurveyInviteProps>;
