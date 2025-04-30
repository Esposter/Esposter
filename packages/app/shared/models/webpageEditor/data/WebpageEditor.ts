import type { ProjectData } from "grapesjs";

import { AItemEntity } from "#shared/models/entity/AItemEntity";
import { z } from "zod";

export class WebpageEditor extends AItemEntity implements ProjectData {
  pages: unknown[] = [{ component: "" }];
}

export const webpageEditorSchema = z.record(z.string().min(1), z.unknown());
