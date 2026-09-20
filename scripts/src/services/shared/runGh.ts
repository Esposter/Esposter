import { MAX_BUFFER_BYTES } from "#src/services/shared/constants";
import { execFileSync } from "node:child_process";

export const runGh = (args: string[]): string =>
  execFileSync("gh", args, { encoding: "utf8", maxBuffer: MAX_BUFFER_BYTES });
