import { getResult } from "@esposter/shared";
// Bubblewrap's --json-status-fd emits newline-separated JSON; an {"exit-code": N} document appears only
// Once the sandboxed child has exited. Its absence means the child never ran — the sandbox itself
// Failed to set up — so return undefined to let the caller raise a sandbox error instead of inventing a
// Result. Malformed lines are ignored rather than thrown (the project bans try/catch; getResult turns a
// Parse failure into an Err).
export const parseBwrapExitCode = (status: string): number | undefined => {
  for (const line of status.split("\n")) {
    const result = getResult(() => JSON.parse(line) as { "exit-code"?: number });
    if (result.isOk() && typeof result.value["exit-code"] === "number") return result.value["exit-code"];
  }
  return undefined;
};
