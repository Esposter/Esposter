import type { ProjectData } from "grapesjs";

import { applyItemMetadataMixin } from "#shared/models/entity/ItemMetadata";
import { Serializable } from "#shared/models/entity/Serializable";
import { z } from "zod";


class BaseEmailEditor extends Serializable implements ProjectData {}
export const EmailEditor = applyItemMetadataMixin(BaseEmailEditor);
export type EmailEditor = typeof EmailEditor.prototype;

export const emailEditorSchema = z.record(z.string().min(1), z.unknown());
