import type { ProjectData } from "grapesjs";
import type { Except } from "type-fest";

import { applyItemMetadataMixin } from "@/shared/models/entity/ItemMetadata";
import { Serializable } from "@/shared/models/entity/Serializable";
import { z } from "zod";

export type EmailEditor = typeof EmailEditor.prototype;

class BaseEmailEditor extends Serializable implements ProjectData {}
export const EmailEditor = applyItemMetadataMixin(BaseEmailEditor);

export const emailEditorSchema = z.record(z.string().min(1), z.unknown()) satisfies z.ZodType<
  Except<ProjectData, "toJSON">
>;
