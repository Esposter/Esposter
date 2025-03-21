import type { ProjectData } from "grapesjs";

import { applyItemMetadataMixin } from "#shared/models/entity/ItemMetadata";
import { Serializable } from "#shared/models/entity/Serializable";
import { z } from "zod";

class BaseWebpageEditor extends Serializable implements ProjectData {}
export const WebpageEditor = applyItemMetadataMixin(BaseWebpageEditor);
export type WebpageEditor = typeof WebpageEditor.prototype;

export const webpageEditorSchema = z.record(z.string().min(1), z.unknown());
