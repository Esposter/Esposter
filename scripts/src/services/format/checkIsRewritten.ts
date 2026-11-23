import type { FormattedSource } from "#src/models/format/FormattedSource";

// Whether the formatter would rewrite a file, from its text beside what it writes for it. A file the formatter does not
// Format has no source, and a file it writes unchanged is not rewritten
export const checkIsRewritten = (source: FormattedSource | undefined): source is FormattedSource =>
  source !== undefined && source.formatted !== source.original;
