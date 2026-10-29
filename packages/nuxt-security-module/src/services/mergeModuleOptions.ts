import type { ContentSecurityPolicy } from "#src/models/ContentSecurityPolicy";
import type { ModuleOptions } from "#src/models/ModuleOptions";
import type { PermissionsPolicy } from "#src/models/PermissionsPolicy";
import type { SecurityHeaders } from "#src/models/SecurityHeaders";

import { NONE_SOURCE } from "#src/services/constants";

// A consumer's options laid over the defaults.
// The two policies that are lists per directive or per feature are merged additively.
// A consumer's sources are appended to the default ones.
// A `false` removes a directive or feature, and a `true` sets a flag-only directive.
// Every other option is replaced as a whole.
// The override that replaces `script-src` with `'unsafe-eval'` is why this is additive.
// A replacement would drop the nonce and `'strict-dynamic'`.
export const mergeModuleOptions = (defaults: ModuleOptions, overrides: Partial<ModuleOptions>): ModuleOptions => ({
  ...defaults,
  ...overrides,
  headers: mergeHeaders(defaults.headers, overrides.headers),
  ssg: overrides.ssg === false ? false : ({ ...defaults.ssg, ...overrides.ssg } as ModuleOptions["ssg"]),
});

const mergeHeaders = (
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

const mergeDirectives = (
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

// `'none'` is the empty list and stands alone: a source added beside a default `'none'` replaces it, which a browser would
// Otherwise ignore with a warning, and a consumer's own `['none']` replaces the default sources
const mergeSources = (defaultSources: boolean | string[] | undefined, sources: string[]): string[] => {
  if (sources.length === 1 && sources[0] === NONE_SOURCE) return sources;

  const mergedSources = new Set([...(Array.isArray(defaultSources) ? defaultSources : []), ...sources]);
  if (mergedSources.size > 1) mergedSources.delete(NONE_SOURCE);
  return [...mergedSources];
};

const mergeFeatures = (
  defaults: false | PermissionsPolicy | undefined,
  overrides: false | PermissionsPolicy | undefined,
): false | PermissionsPolicy | undefined => {
  if (overrides === false || defaults === false) return overrides ?? defaults;
  if (overrides === undefined) return defaults;

  const merged: PermissionsPolicy = { ...defaults };
  for (const [feature, sources] of Object.entries(overrides))
    if (sources === false) delete merged[feature];
    else merged[feature] = [...new Set([...(merged[feature] || []), ...(sources || [])])];

  return merged;
};
