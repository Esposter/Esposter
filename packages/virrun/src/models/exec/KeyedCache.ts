import { z } from "zod";
// A host-fingerprinted probe result persisted across processes so a fresh `virrun -- <cmd>` (a new process per
// Command) reuses a prior process's verdict instead of re-running the probe. `key` fingerprints the host
// (getHostFingerprint) so the value self-invalidates when the host changes underneath it; `value` is the probe's
// Result; `storedAtMs` is stamped by writeKeyedCache so a reader can bound the value's age — the escape hatch for
// State the key cannot see (switching a node manager's active version leaves platform + kernel release identical).
// Crosses a process boundary as JSON, so it is zod-validated on read (readKeyedCache). Generic over the capturing
// Probe — the os-backend bwrap verdict, the win32 WSL interactive-login environment, and the WSL native cache root
// Each persist one.
export interface KeyedCache<TValue> {
  readonly key: string;
  readonly storedAtMs: number;
  readonly value: TValue;
}

export const createKeyedCacheSchema = <TValue>(
  valueSchema: z.ZodType<TValue>,
): z.ZodObject<{ key: z.ZodString; storedAtMs: z.ZodNumber; value: z.ZodType<TValue> }> =>
  z.object({ key: z.string(), storedAtMs: z.number(), value: valueSchema }) satisfies z.ZodType<KeyedCache<TValue>>;
