import type { DatasetReference } from "#shared/models/dataset/DatasetReference";
import type { ToData } from "@esposter/shared";
import type { MjmlNode, MjmlRootProps } from "mjml-blocks";

import { datasetReferenceSchema } from "#shared/models/dataset/DatasetReference";
import { AItemEntity, aItemEntitySchema } from "#shared/models/entity/AItemEntity";
import { MAX_EMAIL_NODES } from "#shared/services/pageBuilder/email/constants";
import { emailDocumentSchema } from "#shared/services/pageBuilder/email/emailDocumentSchema";
import { emailBodyChildrenSchema } from "#shared/services/pageBuilder/email/emailNodeSchema";
import { emailRegistry } from "#shared/services/pageBuilder/email/emailRegistry";
import { noteRichText } from "#shared/services/pageBuilder/email/noteRichText";
import { STARTER_EMAIL_SOURCE } from "#shared/services/pageBuilder/email/starterEmailSource";
import { MAX_RESOURCE_CONTENT_SIZE } from "#shared/services/resource/constants";
import { parseMjmlDocument } from "mjml-blocks";
import { z } from "zod";

// The document a new email is written from, read back from the MJML it is written in. The starter is ours, so a failure
// to read it is a broken build, which the starter's own test catches before it ships
const readStarterEmail = () => {
  const result = parseMjmlDocument(
    STARTER_EMAIL_SOURCE,
    emailRegistry,
    emailBodyChildrenSchema,
    noteRichText,
    MAX_EMAIL_NODES,
  );
  if (!result.success) throw new Error("The starter email does not read back as an email");

  return result.data;
};

// An email's working copy: the MJML document the page builder edits, its body and head, with the bound dataset that its
// Merge fields and personalised export read. The published snapshot carries the html the server compiled at publish
export class EmailEditor extends AItemEntity {
  content: MjmlNode[] = [];
  // The bound dataset whose columns become merge fields and drive personalised export
  datasetReference?: DatasetReference;
  // The compiled html of a published snapshot. The server compiles the document at publish, so no working copy holds it
  html?: string;
  root: { props: MjmlRootProps } = { props: {} };

  constructor(init?: Partial<EmailEditor>) {
    super();
    Object.assign(this, init);
    if (init?.content === undefined) Object.assign(this, readStarterEmail());
  }
}

// The document's schema, which takes the body and head alone, with the dataset binding and the published html beside them
export const emailEditorSchema = emailDocumentSchema.and(
  z.object({
    ...aItemEntitySchema.shape,
    datasetReference: datasetReferenceSchema.optional(),
    html: z.string().max(MAX_RESOURCE_CONTENT_SIZE).meta({ readOnly: true }).optional(),
  }),
) satisfies z.ZodType<ToData<Omit<EmailEditor, "content" | "root">>>;
