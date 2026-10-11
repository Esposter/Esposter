import { z } from "zod";

// The commit an output was written at, whether its producer's paths held uncommitted changes then, and those paths
export interface ProducerStamp {
  commit: string;
  isDirty: boolean;
  producerPaths: string[];
}

export const producerStampSchema: z.ZodType<ProducerStamp> = z.object({
  commit: z.string(),
  isDirty: z.boolean(),
  producerPaths: z.array(z.string()),
});
