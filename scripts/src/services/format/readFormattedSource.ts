import type { FormattedSource } from "#src/models/format/FormattedSource";

import { formatSource } from "#src/services/format/formatSource";
import { readFormattableText } from "#src/services/format/readFormattableText";

// A file's text beside what the repository's formatter writes for it, or none for a file the formatter does not format:
// A Link, a binary file, or a file type it has no parser for. This is the one file's answer, which a run the formatter
// Cannot finish falls back to
export const readFormattedSource = (
  relativePath: string,
  repositoryRoot: string,
  mainCheckoutRoot: string,
): FormattedSource | undefined => {
  const original = readFormattableText(relativePath, repositoryRoot);
  if (original === undefined) return undefined;
  const formatted = formatSource(original, relativePath, repositoryRoot, mainCheckoutRoot);
  if (formatted === undefined) return undefined;
  return { formatted, original };
};
