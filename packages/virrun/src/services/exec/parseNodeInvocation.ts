import type { NodeInvocation } from "@/models/exec/NodeInvocation";

import { tokenizeShellCommand } from "@/services/exec/tokenizeShellCommand";
// Recognise `node -e <code>` / `node --eval <code>` (inline) and `node <file>` (a lone non-flag
// Path, no script args yet) and return what the in-process runner should execute. Returns undefined
// For anything we do not emulate — other flags, file runs with extra args, or shell features
// (tokenizeShellCommand rejects unquoted operators) — so the vfs backend defers to native and
// Correctness is preserved.
export const parseNodeInvocation = (command: readonly string[] | string): NodeInvocation | undefined => {
  const tokens = typeof command === "string" ? tokenizeShellCommand(command) : [...command];
  if (!tokens) return undefined;
  const [binary, second, third, ...rest] = tokens;
  if (binary !== "node" || second === undefined) return undefined;
  if (second === "-e" || second === "--eval")
    return third !== undefined && rest.length === 0 ? { code: third, file: "" } : undefined;
  // `node <file>`: a single non-flag argument with no script args (those are not emulated yet).
  return third === undefined && rest.length === 0 && second !== "" && !second.startsWith("-")
    ? { code: "", file: second }
    : undefined;
};
