import { applyItemMetadataMixin, itemMetadataSchema } from "@/models/shared/ItemMetadata";
import type { Except } from "type-fest";
import { z } from "zod";

export class BaseEmailEditor {
  mjml = "";

  toJSON() {
    return JSON.stringify({ ...this });
  }
}

export type EmailEditor = typeof EmailEditor.prototype;
export const EmailEditor = applyItemMetadataMixin(BaseEmailEditor);

export const emailEditorSchema = z
  .object({
    mjml: z.string(),
  })
  .merge(itemMetadataSchema) satisfies z.ZodType<Except<EmailEditor, "toJSON">>;
