// oxlint-disable no-control-regex, unicorn/no-hex-escape -- \x1b is the ANSI ESC this pattern matches, intentionally
import { describe } from "vitest";
// Shared test helper: drops every ANSI SGR sequence from a string so a format-function assertion checks the message
// Content alone, independent of whether color is on (checkIsColorEnabled reads the ambient terminal/env, which differs
// Between an interactive shell and CI). The coloring itself is verified in `colorize.test.ts` /
// `checkIsColorEnabled.test.ts`, so these assertions don't re-test it — they'd otherwise be non-deterministic across
// Environments. Matches both `virrun`'s own colorize output and a child tool's (e.g. node util.inspect) coloring.
export const stripAnsi = (value: string): string => value.replaceAll(/\x1B\[[\d;]*m/gu, "");

describe.todo("stripAnsi");
