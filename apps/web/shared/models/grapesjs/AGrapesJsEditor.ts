import type { ToData } from "@esposter/shared";
import type { ProjectData } from "grapesjs";

import { AItemEntity, aItemEntitySchema } from "#shared/models/entity/AItemEntity";
import { z } from "zod";

// Subclasses only supply their default pages template and their own typed init constructor
// (the constructor cannot live here: subclass field initializers run after super(), so a base
// Object.assign(this, init) would be overwritten by the subclass pages default).
export abstract class AGrapesJsEditor extends AItemEntity implements ProjectData {
  [key: string]: unknown;
  abstract pages: unknown[];
}

export const grapesJsEditorSchema = z
  .object({
    ...aItemEntitySchema.shape,
    pages: z.unknown().array().min(1),
  })
  // Every GrapesJS key a model does not name — styles, assets, symbols — rides through here. A subclass
  // Schema is built by spreading `.shape`, which copies fields and nothing else, so each one re-declares
  // The catchall or silently strips the editor's own state on parse
  .catchall(z.unknown()) satisfies z.ZodType<ToData<AGrapesJsEditor>>;
