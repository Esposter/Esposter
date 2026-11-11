import { z } from "zod";

// A reference from an arrow end to a shape: the shape's id, and the index of one of its connection points
export interface ArrowBinding {
  connectionPointIndex: number;
  elementId: string;
}

export const arrowBindingSchema: z.ZodObject<{ connectionPointIndex: z.ZodNumber; elementId: z.ZodUUID }> = z.object({
  connectionPointIndex: z.int().nonnegative(),
  elementId: z.uuidv4(),
}) satisfies z.ZodType<ArrowBinding>;
