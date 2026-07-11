---
title: Warm daemon
description: A resident forked-snapshot + node process between invocations to amortize the per-run mount and boot floor.
---

# Warm daemon

Keep a forked snapshot + warm node process resident between invocations, so repeated `virrun -- <cmd>` amortizes the overlay mount + node boot instead of paying the per-run sandbox-mount floor each time.

**Why not:** The payoff is bounded and the cost is not. The committed platform bench artifacts show the warm fork already sits near native parity on real commands (typecheck/build/test 0.76–0.95× on Linux); a daemon would only shave the sub-second per-run mount + node-boot floor off commands whose wall-clock is dominated by the child toolchain, which a resident process can't speed up. For that bounded win it adds a permanent, heavyweight surface: a resident process keyed by lockfile hash with invalidate/re-fork, IPC for dispatch + streamed stdio + exit-code propagation, lifecycle (idle timeout, crash recovery), and — the real blocker — a **live, long-lived sandbox** that must be proven unable to outlive its isolation guarantees. That security surface alone outweighs a sub-second-per-run gain on a tool whose whole thesis is "spin up / throw away, no resident machine state."

Revisit only if a profile of the real dogfood loop shows the per-run floor is a material fraction of wall-clock across common commands **and** a resident-sandbox security model is designed that demonstrably cannot outlive its isolation — both, before any IPC/lifecycle code.
