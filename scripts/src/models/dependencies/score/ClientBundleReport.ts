import { z } from "zod";

// The fields of `nuxt analyze`'s raw-data report the bundle column reads: each module's gzipped bytes in one bundle part,
// And the module that part belongs to, by its id in the report's own module table
export interface ClientBundleReport {
  nodeMetas: Record<string, { id: string }>;
  nodeParts: Record<string, { gzipLength: number; metaUid: string }>;
}

export const clientBundleReportSchema: z.ZodType<ClientBundleReport> = z.object({
  nodeMetas: z.record(z.string(), z.object({ id: z.string() })),
  nodeParts: z.record(z.string(), z.object({ gzipLength: z.number(), metaUid: z.string() })),
});
