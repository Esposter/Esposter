import { ExecFileError } from "#src/models/exec/util/ExecFileError";
import { normalizeString } from "@esposter/shared";

// Wsl.exe wraps its reason across lines, and every place that names it holds one
const WHITESPACE_REGEX = /\s+/gu;
// Why a wsl.exe call failed, in wsl.exe's own words on one line (a host out of memory reads "Insufficient system
// Resources … HCS/0x800705aa"): the child's reason when it ran, else the spawn's own message.
export const readWslFailureReason = (error: Error): string => {
  const output = error instanceof ExecFileError ? error.reason : error.message;
  return normalizeString(output.replaceAll(WHITESPACE_REGEX, " "));
};
