import type { ProjectData } from "grapesjs";
import type { Except } from "type-fest";

import { applyItemMetadataMixin } from "@/shared/models/itemMetadata";
import { z } from "zod";

export type WebpageEditor = typeof WebpageEditor.prototype;

export class BaseWebpageEditor implements ProjectData {
  toJSON() {
    return JSON.stringify({ ...this });
  }
}
export const WebpageEditor = applyItemMetadataMixin(BaseWebpageEditor);

export const webpageEditorSchema = z.record(z.string().min(1), z.unknown()) satisfies z.ZodType<
  Except<ProjectData, "toJSON">
>;
