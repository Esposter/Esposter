import type { ArrowEnd } from "#src/models/ArrowEnd";
import type { ArrowPathKind } from "#src/models/ArrowPathKind";
import type { ItemEntityType } from "@esposter/shared";

import { arrowEndSchema } from "#src/models/ArrowEnd";
import { arrowPathKindSchema } from "#src/models/ArrowPathKind";
import { PositionedElementType } from "#src/models/PositionedElementType";
import { z } from "zod";

// An arrow: two ends, each bound to a shape's connection point or free, with its path kind and the text it owns as its label
export interface ArrowElement extends ItemEntityType<PositionedElementType.Arrow> {
  end: ArrowEnd;
  id: string;
  label: string;
  pathKind: ArrowPathKind;
  start: ArrowEnd;
}

export const arrowElementSchema: z.ZodObject<{
  end: typeof arrowEndSchema;
  id: z.ZodUUID;
  label: z.ZodString;
  pathKind: typeof arrowPathKindSchema;
  start: typeof arrowEndSchema;
  type: z.ZodLiteral<PositionedElementType.Arrow>;
}> = z.object({
  end: arrowEndSchema,
  id: z.uuid(),
  label: z.string(),
  pathKind: arrowPathKindSchema,
  start: arrowEndSchema,
  type: z.literal(PositionedElementType.Arrow),
}) satisfies z.ZodType<ArrowElement>;
