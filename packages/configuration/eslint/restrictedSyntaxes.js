// Entries shared between script (`no-restricted-syntax` in typescriptRules) and template expressions
// (`vue/no-restricted-syntax` in vueRules) — the two rules scan disjoint parts of an SFC, so a ban that
// Applies to both contexts must be spread into both.
export default [
  {
    // `router.replace({ query })` is a query-string update, not navigation, so only `push` is banned.
    message:
      "Use `navigateTo(target, { replace: true })` instead of `router.push` for navigation. (`router.replace({ query })` for query-only updates is fine.)",
    selector:
      "CallExpression[callee.property.name='push']:matches([callee.object.name=/^\\$?router$/], [callee.object.callee.name='useRouter'], [callee.object.property.name='$router'])",
  },
  {
    // The last of the mutating four, and banned the same way as `sort`/`reverse` are by oxlint: an in-place
    // Splice is a `toSpliced(...)` and an assignment back, which is the version a reader can follow — the old
    // Array is never half-updated, and a caller holding it does not watch it change underneath them. Draining
    // One (`splice(0)`) is the same rule: take the array, put a fresh one in its place.
    message: "Use `toSpliced(...)` and assign the result — `splice` mutates the array every other holder can see.",
    selector: "CallExpression[callee.property.name='splice']",
  },
  {
    // The `.then`/`.catch`/`.finally` ban is the other half of the try/catch one in typescriptRules: both shapes
    // Route a failure past the Result the caller is supposed to read. The promise-queue exception the
    // Error-handling skill names, and the two primitives that wrap a synchronously-throwing callback, disable
    // This rule on the line with their reason — there is nowhere else the shape is correct.
    message:
      "Use `getResult`/`getResultAsync` + `.match` instead of `.then`/`.catch`/`.finally` (`withFinalizer`/`withFinalizerAsync` for cleanup) — see the error-handling skill.",
    selector: "CallExpression[callee.property.name=/^(catch|finally|then)$/]",
  },
  {
    // A spread that exists only to reach `.map` builds a whole intermediate array to throw away; `Array.from`
    // Takes the map function and allocates once. The two are not always the same call, which is why the rewrite
    // Is read rather than applied: the spread drains the iterable before any callback runs where `Array.from`
    // Interleaves them, so an iterator its own callback advances yields a different array — and `.map` passes
    // `(value, index, array)` where `Array.from` passes `(value, index)`, so a callback reading a third
    // Parameter changes meaning. Either case keeps its evaluation order as `Array.from(iterable).map(fn)`, which
    // This selector does not match. A multi-element literal is not matched either: `[...a, ...b]` is a
    // Concatenation, and there is no iterable for `Array.from` to take.
    message:
      "Use `Array.from(iterable, fn)` rather than spreading into an array to `.map` it — or `Array.from(iterable).map(fn)` where the callback needs its third argument or the iterator carries state.",
    selector:
      "CallExpression[callee.type='MemberExpression'][callee.computed=false][callee.property.name='map'][callee.object.type='ArrayExpression'][callee.object.elements.length=1][callee.object.elements.0.type='SpreadElement']",
  },
  {
    // The pair a hand-rolled plural is always written as. `pluralize` selects through `Intl.PluralRules`, so the
    // Ternary is not even equivalent to it — the rules object is the seam a non-English locale changes, and an
    // Inline suffix is written once per surface and drifts, which is how the same count reads "1 result" on one
    // Screen and "1 results" on the next. The selector is the literal pair rather than anything about the
    // Template around it, so a suffix built in a variable is caught the same way it is inside a string. That
    // Breadth is the trade: a non-plural `s`, as in `http${isSecure ? "s" : ""}`, matches too and disables this
    // On the line with that reason. Narrowing to a plural context is not on offer — the ternary is as often
    // Assigned to a variable as written next to the count, and neither position is in the node.
    message:
      "Use `pluralize(word, count)` from `#shared/util/text/pluralize` rather than a hand-rolled plural suffix — see the string-utils skill.",
    selector:
      "ConditionalExpression:matches([consequent.value=''][alternate.value='s'], [consequent.value='s'][alternate.value=''])",
  },
  {
    // Banned outright (no Vue modifier exists for it, and it couples behavior to listener registration order).
    message:
      "stopImmediatePropagation is banned — it couples behavior to listener registration order. Restructure the handlers (or use @event.stop) instead.",
    selector: "CallExpression[callee.property.name='stopImmediatePropagation']",
  },
  {
    // The bare API is the one that has to answer "which environment is this" at every call site, and answers it
    // Differently each time — which is how a debounced draft save came to throw `window is not defined` in a
    // Node-environment test. VueUse's ref reads the default off-browser instead. One-shot I/O that genuinely
    // Cannot be a ref belongs in a client-only phase and disables this rule there with that reason. Tests are
    // Unaffected: they address the global bare, which this selector does not match.
    message:
      "Use `useLocalStorage(LocalStorageKey.X, default)` rather than `window.localStorage` — see /docs/architecture/browser-execution.",
    selector: "MemberExpression[object.name='window'][property.name='localStorage']",
  },
  {
    // A browser global read at the top level of a module is read while the module is being evaluated, which on
    // The server is before any phase has had the chance to decide anything — so this is the one position where
    // The environment question cannot have been answered already. Inside a function it can have been, which is
    // Why the selector stops there: `onMounted`, an event handler and a `.client.ts` plugin's default export are
    // All correct, and telling them apart is a reading pass rather than a pattern. A genuine top-level fork
    // Disables this on the line with its reason, the same way the ban above is excepted.
    message:
      "A browser global at module scope is evaluated during SSR — move it into a phase (`onMounted`, `.client.ts`) or a ref — see /docs/architecture/browser-execution.",
    // `localStorage` is excluded rather than left to match both: the ban above names the replacement for it, and
    // A module-scope `window.localStorage` matching both selectors reports the same node twice
    selector: "MemberExpression[object.name='window'][property.name!='localStorage']:not(:function *)",
  },
];
