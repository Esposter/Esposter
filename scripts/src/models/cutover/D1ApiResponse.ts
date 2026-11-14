import { z } from "zod";

// The envelope the D1 query endpoint answers with: one result per statement, and the error messages when a request is refused
export const d1ApiResponseSchema = z.object({
  errors: z.array(z.object({ message: z.string() })),
  result: z
    .array(
      z.object({
        results: z.array(z.record(z.string(), z.unknown())).optional(),
        success: z.boolean(),
      }),
    )
    .nullable(),
  success: z.boolean(),
});
export type D1ApiResponse = z.infer<typeof d1ApiResponseSchema>;
