import type { ContentSecurityPolicy } from "#src/models/ContentSecurityPolicy";

import { mergeSources } from "#src/services/mergeSources";

export const mergeDirectives = (
  defaults: ContentSecurityPolicy | false | undefined,
  overrides: ContentSecurityPolicy | false | undefined,
): ContentSecurityPolicy | false | undefined => {
  if (overrides === false || defaults === false) return overrides ?? defaults;
  if (overrides === undefined) return defaults;

  const merged: ContentSecurityPolicy = { ...defaults };
  for (const [directive, value] of Object.entries(overrides))
    if (value === false) delete merged[directive];
    else if (Array.isArray(value)) merged[directive] = mergeSources(merged[directive], value);
    else merged[directive] = value;

  return merged;
};
