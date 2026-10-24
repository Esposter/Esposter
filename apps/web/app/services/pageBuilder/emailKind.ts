import type { EmailKind } from "@/models/pageBuilder/EmailKind";

import { EMAIL_NODE_TYPE_TITLE_MAP } from "#shared/services/pageBuilder/email/constants";
import { createEmailNode } from "#shared/services/pageBuilder/email/createEmailNode";
import { emailDocumentSchema } from "#shared/services/pageBuilder/email/emailDocumentSchema";
import { emailNodeChildren } from "#shared/services/pageBuilder/email/emailNodeChildren";
import { emailNodeSchema } from "#shared/services/pageBuilder/email/emailNodeSchema";
import { emailRegistry } from "#shared/services/pageBuilder/email/emailRegistry";
import { emailRootFormSchema } from "#shared/services/pageBuilder/email/emailRootFormSchema";
import { PageBuilderEditor } from "@/models/pageBuilder/PageBuilderEditor";
import { EMAIL_PALETTE_CATEGORIES } from "@/services/pageBuilder/email/constants";
import { MjmlNodeType } from "mjml-blocks";

export const emailKind: EmailKind = {
  children: emailNodeChildren,
  createNode: createEmailNode,
  documentSchema: emailDocumentSchema,
  editor: PageBuilderEditor.Email,
  nodeSchema: emailNodeSchema,
  paletteCategories: EMAIL_PALETTE_CATEGORIES,
  registry: emailRegistry,
  rootFormSchema: emailRootFormSchema,
  textType: MjmlNodeType.Text,
  titles: EMAIL_NODE_TYPE_TITLE_MAP,
};
