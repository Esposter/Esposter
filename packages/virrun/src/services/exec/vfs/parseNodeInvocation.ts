import type { NodeInvocation } from "@/models/exec/vfs/NodeInvocation";

import { tokenizeShellCommand } from "@/services/exec/vfs/tokenizeShellCommand";
// Recognise `node -e/--eval <code>` and a lone `node <file>` (no script args) and return what the in-process
// Runner should execute. Returns undefined for anything not emulated, so the vfs backend defers to native.
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
