import type { ProjectData } from "grapesjs";
import type { Except } from "type-fest";

import { z } from "zod";
import { applyItemMetadataMixin } from "~/shared/models/entity/ItemMetadata";

export type EmailEditor = typeof EmailEditor.prototype;

class BaseEmailEditor implements ProjectData {
  toJSON() {
    return JSON.stringify({ ...this });
  }
}
export const EmailEditor = applyItemMetadataMixin(BaseEmailEditor);

export const emailEditorSchema = z.record(z.string().min(1), z.unknown()) satisfies z.ZodType<
  Except<ProjectData, "toJSON">
>;
