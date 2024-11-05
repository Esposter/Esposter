import type { ProjectData } from "grapesjs";
import type { Except } from "type-fest";

import { applyItemMetadataMixin } from "@/shared/models/itemMetadata";
import { z } from "zod";

export class BaseEmailEditor implements ProjectData {
  toJSON() {
    return JSON.stringify({ ...this });
  }
}

export type EmailEditor = typeof EmailEditor.prototype;
export const EmailEditor = applyItemMetadataMixin(BaseEmailEditor);

export const emailEditorSchema = z.record(z.string().min(1), z.unknown()) satisfies z.ZodType<
  Except<ProjectData, "toJSON">
>;
