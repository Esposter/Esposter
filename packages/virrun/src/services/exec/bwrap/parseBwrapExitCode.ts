import { getResult, jsonDateParse } from "@esposter/shared";
// Bubblewrap's --json-status-fd emits newline-separated JSON; an {"exit-code": N} document appears only once the
// Sandboxed child has exited. Its absence means the child never ran (the sandbox failed to set up), so return
// Undefined to let the caller raise a sandbox error instead of inventing a result.
export const parseBwrapExitCode = (status: string): number | undefined => {
  for (const line of status.split("\n")) {
    const exitCode = getResult(() => jsonDateParse<{ "exit-code"?: number }>(line)).match(
      (value) => value["exit-code"],
      () => undefined,
    );
    if (typeof exitCode === "number") return exitCode;
  }
  return undefined;
};
