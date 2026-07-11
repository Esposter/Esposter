---
title: Whole-repo routing
description: Route every command through the sandbox by default — a transparent shim or single switch instead of per-command prefixes.
---

# Whole-repo routing

Make every command run under the sandbox by default — a transparent shim or a single switch that prefixes `virrun --` onto all of install / build / test / dev repo-wide, instead of adopting one command at a time.

**Why deferred:** Three shipped-state facts make this wrong today — not a design that can be flipped on:

- **`Auto` still resolves to `native`.** No isolating backend has beaten the gates by default, so a blanket prefix runs on the host with zero isolation and zero speedup — pure process-spawn overhead.
- **The `os` backend is ephemeral and isolated by design.** Writes land in an invisible tmpfs upper discarded on dispose (write-back only reconciles a mutation command's produced files, not a `dev` server's live state). Side-effecting long-running commands cannot be transparently wrapped — that is the whole point of isolation, and it is incompatible with "wrap everything."
- **The adoption principle forbids it.** "Never migrate the repo. Migrate one command." Whole-repo routing throws away per-command reversibility and the benchmark/correctness datapoint each rung produces ([adoption](/docs/virrun/adoption)).

**Revisit when:** A viable transparent-interception seam exists. The PATH shim is measured unviable for pnpm-local tools (pnpm prepends `.bin` ahead of anything inherited), so the natural next rung is a spawn-level interceptor (`NODE_OPTIONS`, or shimming `pnpm` itself) — and that, unlike the prefix, would need a committed allowlist to decide which no-prefix commands sandbox. Until such a seam proves out, per-command prefixing stays the mechanism.

**Cheaper interim:** The adoption ladder already covers the need — prefix one command, promote to a `package.json` script, commit the config backend selection — scoped to commands proven on the gates.
