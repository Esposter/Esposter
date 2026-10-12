// An allowlist per feature.
// An empty list denies the feature everywhere, and `false` drops the feature from the header
export type PermissionsPolicy = Record<string, false | string[] | undefined>;
