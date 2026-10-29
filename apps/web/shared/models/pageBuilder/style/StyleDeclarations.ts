import type { StyleProperty } from "#shared/models/pageBuilder/style/StyleProperty";

import { stylePropertySchema } from "#shared/models/pageBuilder/style/StyleProperty";
import { styleValueSchema } from "#shared/services/pageBuilder/style/styleValueSchema";
import { z } from "zod";

export type StyleDeclarations = Partial<Record<StyleProperty, string>>;

export const styleDeclarationsSchema = z.partialRecord(
  stylePropertySchema,
  styleValueSchema,
) satisfies z.ZodType<StyleDeclarations>;
