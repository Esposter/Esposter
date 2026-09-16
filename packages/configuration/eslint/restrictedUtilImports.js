// `util/` holds dependency-free universals — math, strings, regexes, engine extensions — and a helper that
// Imports a third-party package belongs in `services/` (`file-organization`, `references/layer-placement.md`).
// ESLint's side rather than oxlint's, because only ESLint honours a negated group: everything is refused except
// The runtime and the workspace packages — a package name opens with a letter or a scope, an alias with `@/`,
// `@@/` or `#`, so the two groups are the packages — and a type-only import stays, since a type is
// Not a dependency. Tests are exempt, since a suite's imports are the runner's.
export default {
  patterns: [
    {
      allowTypeImports: true,
      group: ["/[a-z]*", "/[a-z]*/**", "/@[a-z]*/**", "!/node:*", "!/@esposter/**"],
      message:
        "A `util/` file imports no third-party package — move the helper to `services/`, where a dependency is what earns the folder. See the file-organization skill.",
    },
  ],
};
