# Constants

Read when declaring, placing or repeating a constant — a literal a config file cannot import, a function's name, or a default option object. The placement and single-source rules are in `SKILL.md`; this page is the three shapes that trip them.

**A config that cannot import a constant repeats the literal** — `references/config-literals.md`.

**Do not extract function names into constants** — use `functionName.name` at the call site, or pass that `.name` down when a helper must report on behalf of the public API. A `CREATE_THING_ERROR_NAME = "createThing"` constant is duplication, not a source of truth. The one binding `.name` cannot serve is a const holding a factory's return — `getWslNativeCacheRoot = createProbeCache({ … })` names an anonymous closure, so its `.name` is `""` and the literal stays; name inference reaches only a function expression assigned directly.

**Default option objects** are constants: export one shared `DEFAULT_*` object from the feature's `services/.../constants.ts` and reuse it everywhere, wrapped in `Object.freeze({ ... } satisfies InterfaceName)` so callers can't mutate the shared default. **`Object.freeze` is shallow**: it protects the top level only, and an array or object held in a property stays mutable. Freeze those values too, or a single caller's `push` becomes every later caller's default.

## Where a constant lives

- **Constants go in `constants.ts`** under `services/`, beside the files that use them — never a production `constants.ts` inside `composables/`, and never a module-scope `const MAX_THING = …` at the top of an SFC or composable: the moment a value is worth naming it is worth importing, and the next file that needs it should find it without reaching into a component. The test and bench equivalents are `constants.test.ts` / `constants.bench.ts`, carrying shared fixture data under the same multi-export exception, colocated with the code under test even when that sits under `composables/`. Helper _functions_ still get one file each (`testing` skill).

## One source per value

- **No duplicate constants — one source of truth per value (per runtime realm).** Never repeat the same literal (magic number/string) or re-declare the same named constant in two files within a realm; extract it to a `constants.ts` and import it when the value is reused or is a real source of truth, and leave single-use literals inline. E.g. `KIBIBYTE = 2 ** 10`, with `MEGABYTE = KIBIBYTE ** 2` derived from it — never a bare `1024`/`2 ** 20`. This includes test files: import the constant, don't re-declare a local copy in the `.test.ts`.
