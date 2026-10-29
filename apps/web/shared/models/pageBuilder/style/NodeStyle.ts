import type { Breakpoint } from "#shared/models/pageBuilder/style/Breakpoint";
import type { StyleDeclarations } from "#shared/models/pageBuilder/style/StyleDeclarations";
import type { StyleState } from "#shared/models/pageBuilder/style/StyleState";

import { breakpointSchema } from "#shared/models/pageBuilder/style/Breakpoint";
import { styleDeclarationsSchema } from "#shared/models/pageBuilder/style/StyleDeclarations";
import { styleStateSchema } from "#shared/models/pageBuilder/style/StyleState";
import { z } from "zod";

// A webpage node's own styles: for each breakpoint, for each state, the declarations the panel wrote
export type NodeStyle = Partial<Record<Breakpoint, Partial<Record<StyleState, StyleDeclarations>>>>;

export const nodeStyleSchema = z.partialRecord(
  breakpointSchema,
  z.partialRecord(styleStateSchema, styleDeclarationsSchema),
) satisfies z.ZodType<NodeStyle>;
