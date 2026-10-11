import type { PermissionsPolicy } from "#src/models/PermissionsPolicy";

// A feature list is written in parentheses, as the Permissions-Policy grammar needs for multiple origins.
// An empty list is the empty allowlist that denies the feature everywhere.
export const serializePermissionsPolicy = (policy: PermissionsPolicy): string =>
  Object.entries(policy)
    .flatMap(([feature, sources]) => (sources === false ? [] : [`${feature}=(${(sources ?? []).join(" ")})`]))
    .join(", ");
