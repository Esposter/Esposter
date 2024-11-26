import type { ProjectData } from "grapesjs";
import type { Except } from "type-fest";

import { z } from "zod";
import { applyItemMetadataMixin } from "~/shared/models/entity/ItemMetadata";

export type WebpageEditor = typeof WebpageEditor.prototype;

class BaseWebpageEditor implements ProjectData {
  toJSON() {
    return JSON.stringify({ ...this });
  }
}
export const WebpageEditor = applyItemMetadataMixin(BaseWebpageEditor);

export const webpageEditorSchema = z.record(z.string().min(1), z.unknown()) satisfies z.ZodType<
  Except<ProjectData, "toJSON">
>;
