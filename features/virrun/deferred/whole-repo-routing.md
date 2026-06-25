# Route the whole repo through virrun at once

Make every command run under the sandbox by default — a transparent PATH shim or a single switch that prefixes `virrun --` onto all of `install` / `build` / `test` / `dev` repo-wide, instead of adopting one command at a time.

## Why deferred

Four shipped-state facts make this slower, wrong, or both today — not a design we can flip on:

- **`Auto` still resolves to `native`.** No isolating backend has beaten the gates by default, so a blanket prefix runs on the host with zero isolation and zero speedup — pure process-spawn overhead. → [specs/exec-isolation.md](../specs/exec-isolation.md)
- **The `os` backend is ephemeral and isolated by design.** Writes land in an invisible tmpfs upper discarded on `dispose()`. `pnpm install` would not populate the host `node_modules`; `nuxt build` would not emit artifacts to host disk; `pnpm dev` runs in a throwaway namespace. Side-effecting commands cannot be transparently wrapped — that is the whole point of isolation, and it is incompatible with "wrap everything."
- **No warm-fork yet (Phase 3).** Every `os` run cold-installs into RAM. Without the snapshot + `fork()` win, repeated runs are strictly slower than native, so routing everything regresses the everyday loop. → [specs/snapshot-fork.md](../specs/snapshot-fork.md)
- **The adoption principle forbids it.** "Never migrate the repo. Migrate one command." Whole-repo routing throws away the per-command reversibility and the benchmark/correctness datapoint each rung is meant to produce. → [specs/adoption.md](../specs/adoption.md)

## Revisit when

Phase 3 warm-fork has landed (so an `os` run is faster than native, not slower) **and** the config allowlist (level 3) is boring and trusted with ≥2 commands routed. At that point the transparent PATH shim (adoption level 4) becomes the natural next rung — still opt-in behind an env flag, still per-command in the allowlist, never an all-or-nothing switch. The on-disk surface it needs is specced in [specs/config-and-cache.md](../specs/config-and-cache.md).

## Cheaper interim

The dogfooding ladder already routes commands one at a time: `virrun -- <cmd>` prefix → promote to a `package.json` script → config allowlist. That delivers the "config + cache" the request is reaching for, scoped to commands proven on the gates. → [specs/adoption.md](../specs/adoption.md)
