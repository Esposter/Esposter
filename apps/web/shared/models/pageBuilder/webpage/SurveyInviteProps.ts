import type { WebpageNodeProps } from "#shared/models/pageBuilder/webpage/WebpageNodeProps";

import { webpageNodePropsSchema } from "#shared/models/pageBuilder/webpage/WebpageNodeProps";
import { pageTextSchema } from "#shared/services/pageBuilder/pageTextSchema";
import { createResourceLinkSchema } from "#shared/services/resource/link/createResourceLinkSchema";
import { ResourceLinkType } from "@esposter/db-schema";
import { z } from "zod";

// A link to a published survey, declared as a resource link so the survey's delete warning names this page
export interface SurveyInviteProps extends WebpageNodeProps {
  label: string;
  surveyId: string;
}

export const surveyInvitePropsSchema = z.object({
  ...webpageNodePropsSchema.shape,
  label: pageTextSchema.min(1),
  surveyId: createResourceLinkSchema(ResourceLinkType.Survey),
}) satisfies z.ZodType<SurveyInviteProps>;
