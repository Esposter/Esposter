import { z } from "zod";

// The fields of `nuxt analyze`'s raw-data report the bundle column reads: each module with the parts it has in each
// Bundle, whether it is the entry, and each part's gzipped bytes
export interface ClientBundleReport {
  nodeMetas: Record<string, { id: string; isEntry: boolean; moduleParts: Record<string, string> }>;
  nodeParts: Record<string, { gzipLength: number }>;
}

export const clientBundleReportSchema: z.ZodType<ClientBundleReport> = z.object({
  nodeMetas: z.record(
    z.string(),
    // The report names isEntry only on the entry module
    z.object({ id: z.string(), isEntry: z.boolean().default(false), moduleParts: z.record(z.string(), z.string()) }),
  ),
  nodeParts: z.record(z.string(), z.object({ gzipLength: z.number() })),
});
