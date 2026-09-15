# Constants

Read when declaring, placing or repeating a constant — a literal a config file cannot import, a function's name, or a default option object. The placement and single-source rules are in `SKILL.md`; this page is the three shapes that trip them.

**A config that cannot import the constant repeats the literal, says why, and is pinned by a test only where nothing downstream fails on the drift.** JSON, `.gitignore` and anything a `postinstall` evaluates have no module resolution for a workspace package, and a walk into `.agents/` owes two exclusions. Editing one: `references/config-literals.md`.

**Do not extract function names into constants** — use `functionName.name` at the call site, or pass that `.name` down when a helper must report on behalf of the public API. A `CREATE_THING_ERROR_NAME = "createThing"` constant is duplication, not a source of truth. The one binding `.name` cannot serve is a const holding a factory's return — `getWslNativeCacheRoot = createProbeCache({ … })` names an anonymous closure, so its `.name` is `""` and the literal stays; name inference reaches only a function expression assigned directly.

**Default option objects** are constants: export one shared `DEFAULT_*` object from the feature's `services/.../constants.ts` and reuse it everywhere, wrapped in `Object.freeze({ ... } satisfies InterfaceName)` so callers can't mutate the shared default. **`Object.freeze` is shallow**: it protects the top level only, and an array or object held in a property stays mutable. Freeze those values too, or a single caller's `push` becomes every later caller's default.
