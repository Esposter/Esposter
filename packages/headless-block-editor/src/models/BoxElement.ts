import { z } from "zod";

// A box: the id and placement of an element that holds its own width and height
export interface BoxElement {
  height: number;
  id: string;
  width: number;
  x: number;
  y: number;
}

export const boxElementSchema: z.ZodObject<{
  height: z.ZodNumber;
  id: z.ZodUUID;
  width: z.ZodNumber;
  x: z.ZodNumber;
  y: z.ZodNumber;
}> = z.object({
  height: z.number().positive(),
  id: z.uuid(),
  width: z.number().positive(),
  x: z.number(),
  y: z.number(),
}) satisfies z.ZodType<BoxElement>;
