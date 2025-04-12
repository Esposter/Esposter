import type { ProjectData } from "grapesjs";

import { AItemEntity } from "#shared/models/entity/AItemEntity";
import { type } from "arktype";

export class WebpageEditor extends AItemEntity implements ProjectData {}

export const webpageEditorSchema = type.Record("string > 0", type.unknown);
