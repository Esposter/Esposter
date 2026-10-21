import type { z } from "zod";

import { MjmlContentKind } from "#src/models/MjmlContentKind";
import { createMjmlRawContentSchema } from "#src/services/createMjmlRawContentSchema";
import { labelContentSchema } from "#src/services/labelContentSchema";

// The content schema each fixed content kind takes: a label-kind or raw-kind component takes its schema from this map and never declares its own, and the renderer parses content by it
// Rich text is not here: its schema is the consumer's rich text definition's
export const MjmlContentKindSchemaMap: Record<Exclude<MjmlContentKind, MjmlContentKind.RichText>, z.ZodString> = {
  [MjmlContentKind.Label]: labelContentSchema,
  [MjmlContentKind.Raw]: createMjmlRawContentSchema(),
};
