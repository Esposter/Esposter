import type { PermissionsPolicy } from "#src/models/PermissionsPolicy";

export const mergeFeatures = (
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
