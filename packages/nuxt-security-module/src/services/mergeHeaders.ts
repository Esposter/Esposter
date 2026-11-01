import type { SecurityHeaders } from "#src/models/SecurityHeaders";

import { mergeDirectives } from "#src/services/mergeDirectives";
import { mergeFeatures } from "#src/services/mergeFeatures";

export const mergeHeaders = (
  defaults: false | SecurityHeaders,
  overrides: false | SecurityHeaders | undefined,
): false | SecurityHeaders => {
  if (overrides === false || defaults === false) return overrides ?? defaults;
  if (overrides === undefined) return defaults;

  return {
    ...defaults,
    ...overrides,
    contentSecurityPolicy: mergeDirectives(defaults.contentSecurityPolicy, overrides.contentSecurityPolicy),
    permissionsPolicy: mergeFeatures(defaults.permissionsPolicy, overrides.permissionsPolicy),
  };
};
