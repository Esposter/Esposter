// A source list per directive.
// `false` drops the directive, and `true` is for the one directive that takes no sources, `upgrade-insecure-requests`
export type ContentSecurityPolicy = Record<string, boolean | string[] | undefined>;
