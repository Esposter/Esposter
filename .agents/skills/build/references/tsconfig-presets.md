# tsconfig presets and the bootstrap package

Read when editing a `tsconfig*.json` preset in `packages/configuration`, or when changing `@esposter/configuration` itself. This page holds the whole rule; `SKILL.md` keeps only the index line.

## tsconfig presets

`tsconfig.base.json` → `tsconfig.library.json` (composite + isolatedDeclarations) → `tsconfig.node.json` (`types: ["node"]`), with `tsconfig.vue.json` a sibling leaf off the base. The base carries **no framework assumption** — anything Vue-specific belongs in the Vue leaf, never at the root where every Node package inherits it.

`tsconfig.build.base.json` holds **excludes and nothing else** — no `compilerOptions`, deliberately. A package's `tsconfig.build.json` extends `["./tsconfig.json", "../configuration/tsconfig.build.base.json"]`, so its build program inherits the same platform, libs and `types` as the program it is typechecked with. Adding a `compilerOptions` block back there re-creates the bug it was written to remove: declarations emitted against a different lib set than the source was written for, invisible until something downstream fails to resolve.

`isolatedDeclarations` is off in the packages that cannot satisfy it — a Drizzle table type cannot be written out by hand — and in any package that **vendors one of those from source**, because the transform runs over the whole module graph rather than per package. That is a tsconfig property; no declaration-generator option waives it for one build.

These are `**/*.json` under a strict `json/json` ESLint language — **no comments**. Rationale goes in the docs page, not the file.

## The bootstrap package

`@esposter/configuration` is built by the factories it exports. Its relative imports carry a `.ts` extension because tsdown loads a config with a native import that will not guess one, and it keeps its exports pointing at `dist` for the same reason. Both are specific to it — don't copy either into another package.

It also throws bare `new Error`, which the `error-handling` skill bans everywhere else in favour of `InvalidOperationError`. That constructor lives in `@esposter/shared`, and `@esposter/shared` builds by calling this package's factories — so depending on it here is a cycle in the build order, not a style choice. The exemption is this package only, and it is why the throws in `generateExports.ts` are not a finding.
