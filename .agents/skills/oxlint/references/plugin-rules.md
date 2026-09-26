# Plugin Rules That Run Under Oxlint

Read when a `vitest/` or `promise/` rule reports, when one of a style pair is on, or when deciding whether a rule with a site or two is switched on.

## `vitest/` rules run under oxlint

The vitest rules come from oxlint's `vitest` plugin, with no `@vitest/eslint-plugin` beside it. All categories are on, so every plugin rule is an error unless configured in `.oxlintrc.json`. Non-obvious entries there:

- **Configured with options** — `consistent-test-it` (`fn: "test"`; the default demands `it` inside `describe`) and `valid-title` (`ignoreTypeOfDescribeName`/`ignoreTypeOfTestName` allow the repo's `describe(functionRef)` convention). The rules are already on via categories; the entries restate `"error"` only to carry the options.
- **Pair rules** — oxlint ships both sides of style pairs; exactly one must be off or they fight: `prefer-called-once` is off because `prefer-called-times` matches the repo's `toHaveBeenCalledTimes(1)`; `no-importing-vitest-globals` is off because the repo imports vitest APIs explicitly (its counterpart `prefer-importing-vitest-globals` stays on).
- **`prefer-each` is on and owns that ban alone.** It asks for what the `testing` skill mandates (`test.each` over a loop of `test`s), so no `no-restricted-syntax` twin sits beside it; adding one back would only ask for a second disable comment on the same line. Measured against planted cases it catches `for`/`for...in`/`for...of` around `test`/`it`, the `.skip` and `.concurrent` forms included, and does not catch a `while` loop.
- **`prefer-describe-function-title` is off** — its fixer only checks that an identifier matching the title is in scope, not that it's a function; for arrays, Zod schemas, routers, or plugin objects the fix produces a `[object Object]` suite title.
- **`warn-todo`/`require-test-timeout`/`require-top-level-describe` are off** — `describe.todo` placeholders and hook-registering `setup*`/test-setup files are conventions here, and per-test timeouts are not used.

## `promise/` rules run under oxlint

The `promise` plugin is on, but most of what it enforces the repo already owns — and four of its rules argue with conventions or with another linter, so they are `"off"`:

- **`prefer-await-to-callbacks` is off** — it reads any `(error) => …` argument as an err-first callback, so every neverthrow `.match(onOk, (error) => …)` and `.orElse((error) => …)` in the repo reports. The pattern it asks you to replace is the one the `error-handling` skill mandates.
- **`avoid-new` is off** — `new Promise` here is deferreds, Phaser tweens, `sleep`, `openIndexedDb` and msw request-started signals. None of them has an `await` form to prefer.
- **`prefer-await-to-then` is off, and the `no-restricted-syntax` ban stays** — every site it reports already carries an `eslint-disable no-restricted-syntax` for the repo's own `.then`/`.catch`/`.finally` ban, so enabling it only asks for a second disable comment on the same line. The custom selector is also the stricter of the two: oxlint's rule skips a chain in a function that is deliberately not `async`, which the ban is written to catch, and its message points at `try`/`catch` — itself banned here — where the selector names `getResult`/`getResultAsync` + `.match`.
- **`no-return-wrap` is off — it contradicts a type-aware rule.** It reports `Promise.all(hooks.map((hook) => Promise.resolve(hook(...args))))` as a redundant wrap, but a `Promisable<void>` hook is not thenable, so removing the wrap makes `typescript/await-thenable` report the same line ("This expression is not Promise-like") — whose own help text prescribes the wrap back. `no-return-wrap` is syntactic and sees no types, so it cannot tell a real wrap from a union being normalised; the type-aware rule wins.
- **`param-names` is enabled at `"error"` with custom patterns** — its default patterns are anchored (`^_?resolve$`), which rejects the descriptive names the `naming` skill asks for (`resolveReadStarted`, `resolveTick`). The entry loosens both to a prefix match (`^_?resolve`, `^_?reject`), so a genuinely wrong name still reports.

Everything else in the plugin is green and left on category defaults.

## Three rules with a hit or two stay off

Each reports under the empirical audit, and none earns turning on:

- **`import/default`** restates TypeScript, which rejects a default import of a module with none (TS1192), and misreads Vite's `?url` imports, whose default the client types declare but the resolved file does not export.
- **`import/no-dynamic-require`** — the repo is ESM, and its only `require` of a computed path is virrun running a script it was handed, which is the point of it.
- **`unicorn/prefer-export-from`** asks for `export { a as b } from`, the alias re-export `file-organization` bans; a constant naming another's value for its own purpose stays a declaration.
