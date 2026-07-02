export enum Environment {
  // No framework prepare step: the warm cache is deps-only (lockfile-keyed) and any source-derived artifact a
  // Postinstall wrote is pruned, matching a plain repo with no generated type surface. The default.
  None = "none",
  // A Nuxt app. The sandbox needs a Linux-generated `.nuxt` — the host's win32-generated copy misfires linux
  // Type-aware lint (`Ref`/aliases/zod collapse to error types) even though it is fine natively. virrun captures
  // `nuxt prepare` output into a source-keyed prepare layer, refreshed only when source changes.
  Nuxt = "nuxt",
}
