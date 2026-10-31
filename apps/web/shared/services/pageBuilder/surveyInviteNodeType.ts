import type { NodeTypeDefinition } from "#shared/models/pageBuilder/NodeTypeDefinition";
import type { SurveyInviteNode } from "#shared/models/pageBuilder/SurveyInviteNode";
import type { SurveyInviteNodeProps } from "#shared/models/pageBuilder/SurveyInviteNodeProps";
import type { OwnProps } from "headless-block-editor";

import { HtmlAttributeName } from "#shared/models/pageBuilder/HtmlAttributeName";
import { HtmlTag } from "#shared/models/pageBuilder/HtmlTag";
import { nodeStyleSchema } from "#shared/models/pageBuilder/NodeStyle";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { SURVEY_INVITE_BUTTON_COLOR } from "#shared/services/pageBuilder/constants";
import { getSurveyInviteUrl } from "#shared/services/pageBuilder/getSurveyInviteUrl";
import { nodeTextSchema } from "#shared/services/pageBuilder/nodeTextSchema";
import { createResourceLinkSchema } from "#shared/services/resource/link/createResourceLinkSchema";
import { ResourceLinkType } from "@esposter/db-schema";
import { z } from "zod";

// A link to one published survey, which the resource-link index finds through the declared surveyId
const surveyInviteFormSchema = z.strictObject({
  label: nodeTextSchema,
  surveyId: createResourceLinkSchema(ResourceLinkType.Survey),
});
const surveyInvitePropsSchema = z.object({
  ...surveyInviteFormSchema.shape,
  style: nodeStyleSchema.optional(),
}) satisfies z.ZodType<OwnProps<SurveyInviteNodeProps>>;

export const surveyInviteNodeType = {
  css: `.survey-invite { display: inline-block; padding: 0.5rem 1rem; border-radius: 0.25rem; background-color: ${SURVEY_INVITE_BUTTON_COLOR}; color: #fff; text-decoration: none; }`,
  formSchema: surveyInviteFormSchema,
  isFocusable: false,
  propsSchema: surveyInvitePropsSchema,
  // The link is absolute, against the origin the page is published from, so it works from any page that holds it
  render: (node, _slots, context) => ({
    attributes: {
      [HtmlAttributeName.Class]: "survey-invite",
      [HtmlAttributeName.Href]: getSurveyInviteUrl(context.origin, node.props.surveyId),
    },
    children: [node.props.label],
    tag: HtmlTag.A,
  }),
  slots: {},
  type: WebpageNodeType.SurveyInvite,
} satisfies NodeTypeDefinition<SurveyInviteNode>;
