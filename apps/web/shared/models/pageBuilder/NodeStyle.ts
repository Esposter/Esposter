import type { StyleBreakpoint } from "#shared/models/pageBuilder/StyleBreakpoint";
import type { StyleProperty } from "#shared/models/pageBuilder/StyleProperty";
import type { StyleState } from "#shared/models/pageBuilder/StyleState";
import type { StyleValue } from "#shared/models/pageBuilder/StyleValue";

import { styleBreakpointSchema } from "#shared/models/pageBuilder/StyleBreakpoint";
import { stylePropertySchema } from "#shared/models/pageBuilder/StyleProperty";
import { styleStateSchema } from "#shared/models/pageBuilder/StyleState";
import { styleValueSchema } from "#shared/models/pageBuilder/StyleValue";
import { z } from "zod";

// A node's style: for each breakpoint, for each state, the value of each property the node sets there
export type NodeStyle = Partial<
  Record<StyleBreakpoint, Partial<Record<StyleState, Partial<Record<StyleProperty, StyleValue>>>>>
>;

export const nodeStyleSchema = z.partialRecord(
  styleBreakpointSchema,
  z.partialRecord(styleStateSchema, z.partialRecord(stylePropertySchema, styleValueSchema)),
) satisfies z.ZodType<NodeStyle>;
