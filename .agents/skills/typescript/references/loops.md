# Loops and iteration

Read when writing or reshaping a loop: converting an iterable, choosing between `for...of` and an index, binding the loop variable, or walking two arrays together. The two bans — `.forEach()` and the single-spread `[...iterable].map` — are enforced and named in `SKILL.md`; this page is the shapes left to judgement.

**`Array.from(iterable, mapFn)` over `[...iterable].map(mapFn)`** for any `Set`/`Map`/non-array iterable — the two-arg form maps while converting, producing no intermediate array. A `Map` iterates as `[key, value]` with no `.entries()` needed: `Array.from(fooMap, ([key, value]) => ({ key, value }))`. `no-restricted-syntax` fails the single-spread shape, so what is left to a reader is the two cases where the rewrite is not the same call — a callback reading `.map`'s third argument, and an iterator its own callback advances — both of which keep their evaluation order as `Array.from(iterable).map(fn)`. A multi-element literal (`[...a, ...b]`) is a concatenation rather than a conversion and is untouched. A callback that drops elements rather than mapping them keeps the two-arg form and filters after it — `Array.from(iterable, toEventOrUndefined).filter((event) => event !== undefined)` — since a bare `Array.from(iterable).flatMap(fn)` is the spread in another spelling, and `unicorn/prefer-spread` reports it as one.

**No index-based `for (let i = 0; i < arr.length; i++)`** for plain array iteration — use `for...of`, and `.entries()` when the index is needed (`for (const [i, item] of arr.entries())`). The `.entries()` iterator cost is negligible (tiny per-element pair alloc, JIT-friendly) versus the readability win.

**Index-based `for` stays** only when the loop genuinely isn't sequential array iteration: step counters (`i += 4`, `i += BATCH_SIZE`), pure counts (`for (let i = 0; i < 3; i++)`), `<=` bounds, multi-condition bounds, or in-body index mutation/lookahead (`line.charAt(i + 1)` then `i++`).

**Destructure in the binding position (loop var, function param) straight to the props you use** — `for (const [i, { id }] of files.entries())`, never binding the whole object and then reading its fields. This _removes_ a binding, so it does not conflict with the ban on a separate `const { x } = obj` line for a single use. Keep the whole binding only when the object is passed on whole, or used too many ways to enumerate cleanly.

**Don't declare intermediate vars that are used once** — inline single-use values; only name a var when it's referenced more than once or the name adds clarity.

**Bound a zip with `break`, not a dual condition** — iterate the driving array via `.entries()` and `if (i >= other.length) break;`.
