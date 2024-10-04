import type { ProjectData } from "grapesjs";
import type { Except } from "type-fest";
import type { z } from "zod";

import { applyItemMetadataMixin, itemMetadataSchema } from "@/models/shared/ItemMetadata";

export class BaseEmailEditor implements ProjectData {
  toJSON() {
    return JSON.stringify({ ...this });
  }
}

export type EmailEditor = typeof EmailEditor.prototype;
export const EmailEditor = applyItemMetadataMixin(BaseEmailEditor);

export const emailEditorSchema = itemMetadataSchema satisfies z.ZodType<Except<EmailEditor, "toJSON">>;
