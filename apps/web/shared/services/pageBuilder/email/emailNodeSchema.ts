import type { EmailNode } from "#shared/models/pageBuilder/email/EmailNode";

import { createPageNodeSchema } from "#shared/services/pageBuilder/createPageNodeSchema";
import { EmailNodeTypeMap } from "#shared/services/pageBuilder/email/EmailNodeTypeMap";
import { z } from "zod";

// Recursive through every slot, so a document parses whole in one pass
export const emailNodeSchema: z.ZodType<EmailNode> = z.lazy(() =>
  z.discriminatedUnion("type", [
    createPageNodeSchema(EmailNodeTypeMap.Button, emailNodeSchema),
    createPageNodeSchema(EmailNodeTypeMap.Column, emailNodeSchema),
    createPageNodeSchema(EmailNodeTypeMap.CustomHtml, emailNodeSchema),
    createPageNodeSchema(EmailNodeTypeMap.Divider, emailNodeSchema),
    createPageNodeSchema(EmailNodeTypeMap.Hero, emailNodeSchema),
    createPageNodeSchema(EmailNodeTypeMap.Image, emailNodeSchema),
    createPageNodeSchema(EmailNodeTypeMap.Navbar, emailNodeSchema),
    createPageNodeSchema(EmailNodeTypeMap.NavbarLink, emailNodeSchema),
    createPageNodeSchema(EmailNodeTypeMap.Section, emailNodeSchema),
    createPageNodeSchema(EmailNodeTypeMap.Social, emailNodeSchema),
    createPageNodeSchema(EmailNodeTypeMap.SocialElement, emailNodeSchema),
    createPageNodeSchema(EmailNodeTypeMap.Spacer, emailNodeSchema),
    createPageNodeSchema(EmailNodeTypeMap.SurveyInvite, emailNodeSchema),
    createPageNodeSchema(EmailNodeTypeMap.Text, emailNodeSchema),
    createPageNodeSchema(EmailNodeTypeMap.Wrapper, emailNodeSchema),
  ]),
);
