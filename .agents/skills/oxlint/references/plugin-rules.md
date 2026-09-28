# Plugin Rules That Run Under Oxlint

Read when a `vitest/` or `promise/` rule reports, when one of a style pair is on, or when deciding whether a rule with a site or two is switched on.

## `vitest/` rules run under oxlint

The vitest rules come from oxlint's `vitest` plugin, with no `@vitest/eslint-plugin` beside it. All categories are on, so every plugin rule is an error unless configured in `oxlint.config.ts`. Non-obvious entries there:

- **Configured with options** — `consistent-test-it` (`fn: "test"`; the default demands `it` inside `describe`) and `valid-title` (`ignoreTypeOfDescribeName`/`ignoreTypeOfTestName` allow the repo's `describe(functionRef)` convention). The rules are already on via categories; the entries restate `"error"` only to carry the options.
- **Pair rules** — oxlint ships both sides of style pairs; exactly one must be off or they fight: `prefer-called-once` is off because `prefer-called-times` matches the repo's `toHaveBeenCalledTimes(1)`; `no-importing-vitest-globals` is off because the repo imports vitest APIs explicitly (its counterpart `prefer-importing-vitest-globals` stays on).
- **`prefer-each` is on and owns that ban alone.** It asks for what the `testing` skill mandates (`test.each` over a loop of `test`s, `references/case-tables.md`), so no `no-restricted-syntax` twin sits beside it; adding one back would only ask for a second disable comment on the same line. Measured against planted cases it catches `for`/`for...in`/`for...of` around `test`/`it`, the `.skip` and `.concurrent` forms included, and does not catch a `while` loop.
- **`prefer-describe-function-title` is off** — its fixer only checks that an identifier matching the title is in scope, not that it's a function; for arrays, Zod schemas, routers, or plugin objects the fix produces a `[object Object]` suite title.
- **`warn-todo`/`require-test-timeout`/`require-top-level-describe` are off** — `describe.todo` placeholders and hook-registering `setup*`/test-setup files are conventions here, and per-test timeouts are not used.

## `promise/` rules run under oxlint

The `promise` plugin is on, but most of what it enforces the repo already owns — and the rules that argue with conventions or with another linter are `"off"`:

- **`prefer-await-to-callbacks` is off** — it reads any `(error) => …` argument as an err-first callback, so every neverthrow `.match(onOk, (error) => …)` and `.orElse((error) => …)` in the repo reports. The pattern it asks you to replace is the one the `error-handling` skill mandates.
- **`avoid-new` is off** — `new Promise` here is deferreds, Phaser tweens, `sleep`, `openIndexedDb` and msw request-started signals. None of them has an `await` form to prefer.
- **`prefer-await-to-then` is off, and the `no-restricted-syntax` ban stays** — every site it reports already carries an `eslint-disable no-restricted-syntax` for the repo's own `.then`/`.catch`/`.finally` ban, so enabling it only asks for a second disable comment on the same line. The custom selector is also the stricter of the two: oxlint's rule skips a chain in a function that is deliberately not `async`, which the ban is written to catch, and its message points at `try`/`catch` — itself banned here — where the selector names `getResult`/`getResultAsync` + `.match`.
- **`no-return-wrap` is off — it contradicts a type-aware rule.** It reports `Promise.all(hooks.map((hook) => Promise.resolve(hook(...args))))` as a redundant wrap, but a `Promisable<void>` hook is not thenable, so removing the wrap makes `typescript/await-thenable` report the same line ("This expression is not Promise-like") — whose own help text prescribes the wrap back. `no-return-wrap` is syntactic and sees no types, so it cannot tell a real wrap from a union being normalised; the type-aware rule wins.
- **`param-names` is enabled at `"error"` with custom patterns** — its default patterns are anchored (`^_?resolve$`), which rejects the descriptive names the `naming` skill asks for (`resolveReadStarted`, `resolveTick`). The entry loosens both to a prefix match (`^_?resolve`, `^_?reject`), so a genuinely wrong name still reports.

Everything else in the plugin is green and left on category defaults.

## Rules with a hit or two that stay off

Each reports under the empirical audit, and none earns turning on:

- **`import/default`** restates TypeScript, which rejects a default import of a module with none (TS1192), and misreads Vite's `?url` imports, whose default the client types declare but the resolved file does not export.
- **`import/no-dynamic-require`** — the repo is ESM, and its only `require` of a computed path is virrun running a script it was handed, which is the point of it.
- **`unicorn/prefer-export-from`** asks for `export { a as b } from`, the alias re-export `file-organization` bans; a constant naming another's value for its own purpose stays a declaration.

## Rules that argue with a shorthand or a convention the repo prefers

Each reports under the empirical audit and is a taste the repo decided the other way — the shorter form is the one written here:

- **`typescript/restrict-plus-operands`** and **`no-multi-assign`** — `object[key] += text` on an `unknown` slot the code already knows is a string, `a.value = b.value = false`, and `current = (cached ??= read())` are kept as written; spelling each out adds a cast or a line and says nothing more.
- **`no-useless-return`** — it reports the `if (…) return; else if …` chain (the `typescript` skill's `references/control-flow.md`, which is also why `no-else-return` is off) and the `return;` closing each `switch` case.
- **`unicorn/prefer-add-event-listener`** — its event list is partial (`onerror` reports, `onsuccess` does not), so obeying it mixes both styles in one handler block, and it cannot tell a DOM target from a SAX parser's `on*` fields.
- **`eslint/prefer-destructuring`** — destructuring a Pinia store's state breaks reactivity (the `pinia` skill), and destructuring a method off its object unbinds it.
- **`no-nested-ternary`** / **`unicorn/no-nested-ternary`** — the sites are expression positions (a Drizzle `where`, a sort comparator, a template binding) with no statement form to move to.
- **`unicorn/prefer-query-selector`** — `getElementById` takes a generated id as is; `querySelector` would need it CSS-escaped.
- **`typescript/no-empty-interface`** — deprecated upstream in favour of `typescript/no-empty-object-type`, which is on with `allowInterfaces: "with-single-extends"` so `interface Foo extends Bar<Baz> {}` still names a type. An interface a consumer augments carries a directive.
- **The `typescript/no-unsafe-*` family** — the `any` they trace comes from third-party types (Phaser, Vue Test Utils wrappers, `TRPCClientError.data`, ApexCharts callbacks), and typing a library's surface for it is not work the repo takes on; the repo's own `any` is already refused at the source by `no-explicit-any`.
- **`typescript/ban-types`** — deprecated upstream; `no-empty-object-type` and `no-unsafe-function-type` (both on) are its successors.
