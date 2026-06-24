import type { NodeInvocation } from "@/models/exec/NodeInvocation";

import { tokenizeShellCommand } from "@/services/exec/tokenizeShellCommand";
// Recognise `node -e <code>` / `node --eval <code>` and return the inline code to run in-process.
// Returns undefined for anything we do not emulate — other flags, file runs (Step B2), or shell
// Features (tokenizeShellCommand rejects unquoted operators) — so the vfs backend defers to native
// And correctness is preserved.
export const parseNodeInvocation = (command: readonly string[] | string): NodeInvocation | undefined => {
  const tokens = typeof command === "string" ? tokenizeShellCommand(command) : [...command];
  if (!tokens) return undefined;
  const [binary, flag, code, ...rest] = tokens;
  if (binary !== "node" || rest.length > 0) return undefined;
  if ((flag === "-e" || flag === "--eval") && code !== undefined) return { code };
  return undefined;
};
