# virrun — Adoption

How a repo moves commands from native execution onto the sandbox **one at a time**, with no rewrite and no risk. Adoption is itself a design surface: if switching a command in is harder than the speedup is worth, nobody switches. The bar is **near-zero barrier, fully reversible, per-command granularity**.

## Principle

Never "migrate the repo." Migrate **one command**. Prove it faster + correct on that command, keep it; otherwise drop back to native by deleting one token. The repo always runs — sandbox is an accelerator layered on top, never a dependency the build needs to function.

## Levels (escalating opt-in, each reversible)

Ordered from lowest commitment to highest. A repo adopts left-to-right and can retreat at any time.

1. **Explicit prefix** — wrap a single invocation:

   ```bash
   virrun -- pnpm install
   virrun -- pnpm test
   ```

   Nothing else changes. This is how every command is first tried and benchmarked. Drop the prefix → native again.

2. **package.json script** — bake the prefix into one script so collaborators get it for free:

   ```jsonc
   {
     "scripts": {
       "test": "virrun -- vitest", // routed
       "build:app": "virrun -- nuxt build", // routed — output flushed via write-back
       "build:packages": "rolldown …", // still native — bootstrap that produces the virrun bin
     },
   }
   ```

   Granularity is per-script. Adopt `test` first, leave `build` native until measured.

3. **Config backend selection** _(realized)_ — a central `virrun.config.json` pins _which backend_ sandboxed commands run through, so the choice is reviewable in one place instead of implied by the host's `auto` default. The `virrun` CLI consults it (`resolveVirrunConfiguration` → `resolveBackend`). It is **not** an allowlist — whether a command is sandboxed is still the prefix's job (level 1–2), per command; the config only answers _how_. Schema, resolution, and the `.virrun/` cache it pairs with: [config-and-cache.md](config-and-cache.md).

4. **PATH shim (transparent)** — _planned, then measured unviable for this repo, then dropped._ The idea was a shim dir earlier on `PATH` intercepting known binaries to sandbox them with zero prefix. It does not work for package-manager-local tools: pnpm prepends both `./node_modules/.bin` and the absolute workspace `.bin` to the **front** of `PATH` before running a script, ahead of anything inherited — so a shim dir lands _after_ `.bin` and never intercepts a script-local binary (`vitest`, `eslint`, `tsgo`, `oxfmt` all resolve from `.bin`). A PATH shim only catches tools resolved from the inherited PATH (global/corepack binaries, or commands run outside a pnpm script). Transparent zero-prefix routing of pnpm-local tools would need a more invasive seam (a `NODE_OPTIONS` spawn-interceptor, or shimming `pnpm` itself), which stays deferred — **level 2 (the prefix baked once into the script) is the reliable mechanism.**

   Transparent routing was also the _only_ mechanism that would have needed a committed allowlist: a command intercepted with no prefix has nothing on it to read, so virrun would have had to look up "should this binary sandbox?" in a list. Since that path is off the table here, virrun carries **no allowlist** — the prefix's presence is the sole switch, and the config only selects the backend. If a viable spawn-interceptor ever lands, the allowlist returns _with_ it, not before.

   **No on/off env flag.** The prefix's presence is the switch — add `virrun --` to adopt a command, remove it to drop it, per command and reviewable. virrun instead injects a vitest-style `VIRRUN=true` signal into every command's environment (read via `isVirrunEnabled`) so a test/config/tool can detect it runs under virrun; that is an **output** virrun sets, never an input that gates routing.

## Auto-fallback (the safety net)

Adoption is only zero-risk if a sandbox path that fails or underperforms silently becomes native:

- **Unsupported** (e.g. native subprocess on the `vfs` backend, or a host without the `os` backend) → fall through to native, warn once, never error the build.
- **Slower** — if the live run trips the benchmark gate (slower than baseline for this command), record it and recommend un-routing. Speed regressions surface, they don't hide.
- **Correctness drift** — if a differential check is wired for that command and it diverges, fail loud and fall back. A wrong sandbox result must never reach the developer.

Fallback means the worst case of adopting a command is "no speedup," never "broken build."

## Dogfooding ladder (this repo)

Esposter is the first consumer. Climb the ladder here, measured at each rung:

1. Wrap one cheap, isolated command with the prefix (e.g. `virrun -- pnpm vitest <one file>`); benchmark vs native; confirm identical output.
2. Promote it to a package.json script once it wins.
3. Add the next command (`typecheck`, then `build`) only after the previous one holds across the benchmark + correctness gates. (`install` is not on the ladder — the os install feeds the fork snapshot, not host disk, so it can't replace a native `pnpm install` → [out-of-scope/materialize-node-modules.md](../out-of-scope/materialize-node-modules.md).)
4. Commit the `virrun.config.json` backend selection once ≥2 commands carry the prefix, so the backend choice is reviewed in one place instead of riding the host default.
5. Transparent zero-prefix routing (the PATH shim) is dropped as unviable for pnpm-local tools — the prefix is the mechanism. Revisit only if a spawn-interceptor seam proves out.

Each rung is a real datapoint feeding [specs/benchmarking.md](benchmarking.md) and [specs/correctness.md](correctness.md) — dogfooding _is_ the test corpus, not a separate effort.

## Constraints / Notes

- One token to opt in, one token to opt out — symmetry is the whole point.
- The wrapper resolves the command, picks a backend (`auto`), and on any miss defers to native — adoption never blocks shipping.
- What's adopted lives in version control as the prefix on a command (script); the backend choice lives in `virrun.config.json` — both reviewable and revertible like any code change.
- The CLI (`virrun`) is the adoption entry point — see [specs/orchestrator-api.md](orchestrator-api.md) for the programmatic API underneath it.
