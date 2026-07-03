import { z } from "zod";
// The host's os-backend capability, persisted across processes so `virrun -- <cmd>` (a fresh process per command)
// Does not re-run the bwrap probe every time. `key` fingerprints the host (platform + kernel release) so the cached
// Verdict self-invalidates when the host changes underneath it; `supported` is the probe's result. Crosses a
// Process boundary as JSON, so it is zod-validated on read (readCapabilityCache). See isOsBackendSupported.
export interface CapabilityCache {
  readonly key: string;
  readonly supported: boolean;
}

export const capabilityCacheSchema: z.ZodObject<{
  key: z.ZodString;
  supported: z.ZodBoolean;
}> = z.object({
  key: z.string(),
  supported: z.boolean(),
}) satisfies z.ZodType<CapabilityCache>;
