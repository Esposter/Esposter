import type { DevValue } from "#src/models/dev/DevValue";

// What the registry reports for a line: a failure always names the usage line of the command it was run against, or
// Is empty when no command matched the name
export type DevResult = { ok: true; value: DevValue } | { error: string; ok: false; usage: string };
