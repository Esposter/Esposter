import type { ProjectData } from "grapesjs";
import type { Except } from "type-fest";

import { applyItemMetadataMixin } from "@/shared/models/entity/ItemMetadata";
import { z } from "zod";

import { Serializable } from "@/shared/models/entity/Serializable";

export type WebpageEditor = typeof WebpageEditor.prototype;

class BaseWebpageEditor extends Serializable implements ProjectData {}
export const WebpageEditor = applyItemMetadataMixin(BaseWebpageEditor);

export const webpageEditorSchema = z.record(z.string().min(1), z.unknown()) satisfies z.ZodType<
  Except<ProjectData, "toJSON">
>;
