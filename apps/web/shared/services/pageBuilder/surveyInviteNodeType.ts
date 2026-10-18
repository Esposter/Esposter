import type { NodeTypeDefinition } from "#shared/models/pageBuilder/NodeTypeDefinition";

import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { SURVEY_INVITE_BUTTON_COLOR } from "#shared/services/pageBuilder/constants";
import { createResourceLinkSchema } from "#shared/services/resource/link/createResourceLinkSchema";
import { ResourceLinkType, ResourceType } from "@esposter/db-schema";
import { RoutePath } from "@esposter/shared";
import { z } from "zod";

// A link to one published survey, which the resource-link index finds through the declared surveyId
const surveyInviteFormSchema = z.strictObject({
  label: z.string().min(1),
  surveyId: createResourceLinkSchema(ResourceLinkType.Survey),
});
const surveyInvitePropsSchema = z.strictObject({ ...surveyInviteFormSchema.shape, id: z.string() });

export const surveyInviteNodeType = {
  css: `.survey-invite { display: inline-block; padding: 0.5rem 1rem; border-radius: 0.25rem; background-color: ${SURVEY_INVITE_BUTTON_COLOR}; color: #fff; text-decoration: none; }`,
  formSchema: surveyInviteFormSchema,
  propsSchema: surveyInvitePropsSchema,
  // The link is absolute, against the origin the page is published from, so it works from any page that holds it
  render: (node, _slots, context) => {
    const { label, surveyId } = surveyInvitePropsSchema.parse(node.props);
    return {
      attributes: { class: "survey-invite", href: `${context.origin}${RoutePath.View(ResourceType.Survey, surveyId)}` },
      children: [label],
      tag: "a",
    };
  },
  slots: {},
  type: WebpageNodeType.SurveyInvite,
} satisfies NodeTypeDefinition;
