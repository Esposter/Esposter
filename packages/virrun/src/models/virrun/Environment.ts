// A framework preset whose source-derived artifacts the sandbox regenerates into a prepare layer. Absence — an
// Optional field left `undefined` — is "no preset": the warm cache is deps-only (lockfile-keyed) and any source-derived
// Artifact a postinstall wrote is pruned, matching a plain repo with no generated type surface. So the enum lists only
// Real presets; there is no `None` sentinel member (undefined carries that state).
export enum Environment {
  // A Nuxt app. The sandbox needs a Linux-generated `.nuxt` — the host's win32-generated copy misfires linux
  // Type-aware lint (`Ref`/aliases/zod collapse to error types) even though it is fine natively. virrun captures
  // `nuxt prepare` output into a source-keyed prepare layer, refreshed only when source changes.
  Nuxt = "nuxt",
}
