# tsconfig presets and the bootstrap package

Read when editing a `tsconfig*.json` preset in `packages/configuration`, or when changing `@esposter/configuration` itself. The rule itself is in `SKILL.md`; this page is the preset chain and what the bootstrap package is exempt from.

## tsconfig presets

`tsconfig.base.json` → `tsconfig.library.json` (composite + isolatedDeclarations) → `tsconfig.node.json` (`types: ["node"]`), with `tsconfig.vue.json` a sibling leaf off the base. The base carries **no framework assumption** — anything Vue-specific belongs in the Vue leaf, never at the root where every Node package inherits it.

A build reads the package's own `tsconfig.json` — tsdown's default — so the program that emits a package is the program its source is typechecked with. `tsconfig.build.base.json` holds **excludes and nothing else** — no `compilerOptions`, deliberately — and is extended by each published Vue package, whose declaration program is loaded from the tsconfig's file list rather than seeded from its entries (`vue-phaserjs`, `genshin-world`), through `["./tsconfig.json", "../configuration/tsconfig.build.base.json"]`, which `getTsdownConfigurationVue` names. The excludes keep its tests out of that program; they change no byte of output and a good share of the build's time. Adding a `compilerOptions` block there re-creates the bug it was written to remove: declarations emitted against a different lib set than the source was written for, invisible until something downstream fails to resolve. No other package needs a build tsconfig: every other `dist` is byte-identical without one.

`isolatedDeclarations` is off in the packages that cannot satisfy it — a Drizzle table type cannot be written out by hand — and in any package that **vendors one of those from source**, because the transform runs over the whole module graph rather than per package. That is a tsconfig property; no declaration-generator option waives it for one build.

Under the tsgo-backed `typescript` fork, an export whose type `isolatedDeclarations` cannot infer does not always report `TS9007`. When the uninferable expression reads a member off a call — `parse(value)?.name ?? value` as an unannotated return — the declaration pass panics with `Unhandled case in Node.Text: *ast.CallExpression` and names no file. The fix is the annotation the rule asked for. Declaration diagnostics run only once a program has no semantic errors, so an earlier type error hides the panic until it is fixed.

These are `**/*.json` under a strict `json/json` ESLint language — **no comments**. Rationale goes in the docs page, not the file.

## The bootstrap package

`@esposter/configuration` is built by the factories it exports, and reaches its own source through `#src/*` like every other package. Its build config is loaded by Node's strip-only type stripping, so what runs at config time can hold no TypeScript-only syntax such as an `enum` (`references/barrels.md`).

It also throws bare `new Error`, which the `error-handling` skill bans everywhere else in favour of `InvalidOperationError`. That constructor lives in `@esposter/shared`, and `@esposter/shared` builds by calling this package's factories — so depending on it here is a cycle in the build order, not a style choice. The exemption is this package only, and it is why the throws in `generateExports.ts` are not a finding.
