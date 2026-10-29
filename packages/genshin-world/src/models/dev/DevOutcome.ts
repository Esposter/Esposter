import type { DevValue } from "#src/models/dev/DevValue";

// What a command's `run` or a variable's read returns: its value, or the error it refuses with
export type DevOutcome = { ok: true; value: DevValue } | { error: string; ok: false };
