import type { ProjectData } from "grapesjs";
import type { Except } from "type-fest";

import { applyItemMetadataMixin } from "@/models/shared/ItemMetadata";
import { z } from "zod";

export class BaseWebpageEditor implements ProjectData {
  toJSON() {
    return JSON.stringify({ ...this });
  }
}

export type WebpageEditor = typeof WebpageEditor.prototype;
export const WebpageEditor = applyItemMetadataMixin(BaseWebpageEditor);

export const webpageEditorSchema = z.record(z.string(), z.unknown()) satisfies z.ZodType<Except<ProjectData, "toJSON">>;
