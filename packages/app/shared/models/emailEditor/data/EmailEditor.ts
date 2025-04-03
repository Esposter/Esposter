import type { ProjectData } from "grapesjs";

import { AItemEntity } from "#shared/models/entity/AItemEntity";
import { z } from "zod";

export class EmailEditor extends AItemEntity implements ProjectData {}

export const emailEditorSchema = z.record(z.string().min(1), z.unknown());
