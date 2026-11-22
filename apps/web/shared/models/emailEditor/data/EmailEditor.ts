import type { DatasetReference } from "#shared/models/dataset/DatasetReference";
import type { ToData } from "@esposter/shared";
import type { MjmlNode, MjmlRootProps } from "mjml-blocks";
import type { Except } from "type-fest";

import { datasetReferenceSchema } from "#shared/models/dataset/DatasetReference";
import { AItemEntity, aItemEntitySchema } from "#shared/models/entity/AItemEntity";
import { emailDocumentSchema } from "#shared/services/pageBuilder/email/emailDocumentSchema";
import { readStarterEmail } from "#shared/services/pageBuilder/email/readStarterEmail";
import { MAX_RESOURCE_CONTENT_SIZE } from "#shared/services/resource/constants";
import { z } from "zod";

// An email's working copy: the MJML document the page builder edits, its body and head, with the bound dataset that its
// Merge fields and personalised export read. The published snapshot carries the html the server compiled at publish
export class EmailEditor extends AItemEntity {
  content: MjmlNode[] = [];
  // The bound dataset whose columns become merge fields and drive personalised export
  datasetReference?: DatasetReference | undefined;
  // The compiled html of a published snapshot. The server compiles the document at publish, so no working copy holds it
  html?: string | undefined;
  root: { props: MjmlRootProps } = { props: { lang: "", title: "" } };

  constructor(init?: Partial<EmailEditor>) {
    super();
    Object.assign(this, init);
    // The starter fills only the document the caller left unset, so a root it was given keeps its props
    if (init?.content === undefined || init?.root === undefined) {
      const starter = readStarterEmail();
      this.content = init?.content ?? starter.content;
      this.root = init?.root ?? starter.root;
    }
  }
}

// The document's schema, which takes the body and head alone, with the dataset binding and the published html beside them
export const emailEditorSchema = emailDocumentSchema.and(
  z.object({
    ...aItemEntitySchema.shape,
    datasetReference: datasetReferenceSchema.optional(),
    html: z.string().max(MAX_RESOURCE_CONTENT_SIZE).meta({ readOnly: true }).optional(),
  }),
) satisfies z.ZodType<ToData<Except<EmailEditor, "content" | "root">>>;
