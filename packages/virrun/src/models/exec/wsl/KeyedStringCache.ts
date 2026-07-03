import { z } from "zod";
// A host-fingerprinted string value persisted across processes so a fresh `virrun -- <cmd>` (a new process per
// Command) reuses a prior process's probe result instead of re-spawning it. `key` fingerprints the host
// (getHostFingerprint) so the value self-invalidates when the host changes underneath it; `value` is the captured
// Result. Crosses a process boundary as JSON, so it is zod-validated on read (readWslEnvironmentCache). Generic over
// The capturing probe — the win32 WSL interactive-login PATH and the WSL native cache root each persist one.
export interface KeyedStringCache {
  readonly key: string;
  readonly value: string;
}

export const keyedStringCacheSchema: z.ZodObject<{
  key: z.ZodString;
  value: z.ZodString;
}> = z.object({
  key: z.string(),
  value: z.string(),
}) satisfies z.ZodType<KeyedStringCache>;
