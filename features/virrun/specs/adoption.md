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
       "build": "nuxt build", // still native — not yet adopted
     },
   }
   ```

   Granularity is per-script. Adopt `test` first, leave `build` native until measured.

3. **Config allowlist** _(realized)_ — a central `virrun.config.json` names which commands route, so scripts stay clean. The `virrun` CLI consults it (`resolveVirrunConfiguration` → `resolveCommandBackend`); removing an entry un-adopts that command repo-wide in one edit. Schema, resolution, and the `.virrun/` cache it pairs with: [config-and-cache.md](config-and-cache.md).

4. **PATH shim (transparent)** — for fully drop-in behaviour: shims earlier on `PATH` intercept known binaries and route per the allowlist. Gated behind an env flag so it is opt-in and instantly disablable:
   ```bash
   VIRRUN=1 pnpm test     # shim routes
   pnpm test               # native
   ```
   This is the most invisible and the most powerful — and the most prone to surprise, so it ships last and stays opt-in via the flag.

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
3. Add the next command (`pnpm install`, then `build`) only after the previous one holds across the benchmark + correctness gates.
4. Graduate to the config allowlist when ≥2 commands are routed.
5. Consider the PATH shim only once the allowlist is boring and trusted.

Each rung is a real datapoint feeding [specs/benchmarking.md](benchmarking.md) and [specs/correctness.md](correctness.md) — dogfooding _is_ the test corpus, not a separate effort.

## Constraints / Notes

- One token to opt in, one token to opt out — symmetry is the whole point.
- The wrapper resolves the command, picks a backend (`auto`), and on any miss defers to native — adoption never blocks shipping.
- Routing decisions live in version control (script or `virrun.config.json`), so what's adopted is reviewable and revertible like any code change.
- The CLI (`virrun`) is the adoption entry point — see [specs/orchestrator-api.md](orchestrator-api.md) for the programmatic API underneath it.
