/** The npm registry document returned for `GET /{pkg}` — the full package metadata, keyed by version. */
export interface Packument {
  versions: Record<string, unknown>;
}
