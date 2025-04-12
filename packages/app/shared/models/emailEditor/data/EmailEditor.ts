import type { ProjectData } from "grapesjs";

import { AItemEntity } from "#shared/models/entity/AItemEntity";
import { type } from "arktype";

export class EmailEditor extends AItemEntity implements ProjectData {}

export const emailEditorSchema = type.Record("string > 0", type.unknown);
