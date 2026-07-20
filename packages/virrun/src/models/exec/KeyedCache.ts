import { z } from "zod";
// A host-fingerprinted probe result persisted across processes so a fresh `virrun -- <cmd>` (a new process per
// Command) reuses a prior process's verdict instead of re-running the probe. `key` fingerprints the host
// (getHostFingerprint) so the value self-invalidates when the host changes underneath it; `value` is the probe's
// Result. Crosses a process boundary as JSON, so it is zod-validated on read (readKeyedCache). Generic over the
// Capturing probe — the os-backend bwrap verdict, the win32 WSL interactive-login PATH, and the WSL native cache
// Root each persist one.
export interface KeyedCache<TValue> {
  readonly key: string;
  readonly value: TValue;
}

export const createKeyedCacheSchema = <TValue>(
  valueSchema: z.ZodType<TValue>,
): z.ZodObject<{ key: z.ZodString; value: z.ZodType<TValue> }> =>
  z.object({ key: z.string(), value: valueSchema }) satisfies z.ZodType<KeyedCache<TValue>>;
