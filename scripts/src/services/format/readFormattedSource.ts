import type { FormattedSource } from "#src/models/format/FormattedSource";

import { formatSource } from "#src/services/format/formatSource";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// A file's text beside what the repository's formatter writes for it, or none for a file the formatter does not format: a
// Binary file, which has no text to format, or a file type it has no parser for. A text file never holds a NUL byte, so
// One anywhere in the buffer makes the file binary
export const readFormattedSource = (relativePath: string, mainCheckoutRoot: string): FormattedSource | undefined => {
  const buffer = readFileSync(join(REPOSITORY_ROOT, relativePath));
  if (buffer.includes(0)) return undefined;
  const original = buffer.toString("utf8");
  const formatted = formatSource(original, relativePath, mainCheckoutRoot);
  if (formatted === undefined) return undefined;
  return { formatted, original };
};
