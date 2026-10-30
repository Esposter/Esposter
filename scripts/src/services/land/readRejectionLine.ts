import { readFirstLine } from "#src/services/shared/readFirstLine";

// The line of a failed push or pull that names the refusal: git's `! [rejected]` line, or its `error:` or `fatal:` line.
// The remote's message comes under that line. Output with none of them reads as its first line.
const REJECTION_LINE_REGEX = /^\s*(?:! \[rejected\]|error:|fatal:)/u;

export const readRejectionLine = (output: string): string =>
  output
    .split(/\r?\n/u)
    .find((line) => REJECTION_LINE_REGEX.test(line))
    ?.trim() ?? readFirstLine(output);
