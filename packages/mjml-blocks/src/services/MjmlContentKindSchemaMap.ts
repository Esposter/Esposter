import type { z } from "zod";

import { MjmlContentKind } from "#src/models/MjmlContentKind";
import { createMjmlRawContentSchema } from "#src/services/createMjmlRawContentSchema";
import { labelContentSchema } from "#src/services/labelContentSchema";

// The content schema each fixed content kind takes: a label-kind or raw-kind component takes it from this map.
// It never declares its own, since the renderer parses content by it.
// Rich text is not here: its schema is the consumer's rich text definition's.
export const MjmlContentKindSchemaMap: Record<
  Exclude<MjmlContentKind, typeof MjmlContentKind.RichText>,
  z.ZodString
> = { [MjmlContentKind.Label]: labelContentSchema, [MjmlContentKind.Raw]: createMjmlRawContentSchema() };
