// oxlint-disable unicorn/no-hex-escape -- \x1b is the conventional, readable spelling of the ANSI ESC in the pattern
import { describe } from "vitest";
// Shared test helper: drops every ANSI SGR sequence from a string so a format-function assertion checks the message
// Content alone, independent of whether color is on (isColorEnabled reads the ambient terminal/env, which differs
// Between an interactive shell and CI). The coloring itself is verified in colorize.test.ts / isColorEnabled.test.ts,
// So these assertions don't re-test it — they'd otherwise be non-deterministic across environments. Matches both
// Virrun's own colorize output and a child tool's (e.g. node util.inspect) coloring.
export const stripAnsi = (value: string): string => value.replaceAll(/\x1B\[[\d;]*m/gu, "");

describe.todo("stripAnsi");
