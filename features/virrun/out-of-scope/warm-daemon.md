Keep a forked snapshot + warm node process resident between invocations so repeated `virrun -- <cmd>` amortizes the overlay mount + node boot instead of paying the per-run sandbox-mount floor each time.

## Why not

The payoff is bounded and the cost is not. The committed `localMonorepo.platform.bench.{linux,win32}.md` show the warm fork already sits ~at native parity on real commands (typecheck/build/test 0.76–0.95× on linux); a daemon would only shave the per-run mount + node-boot floor (sub-second) off commands whose wall-clock is dominated by the child toolchain (tsgo/rolldown/vitest), which a resident process can't speed up. For that bounded win it adds a permanent, heavyweight surface: a resident process keyed by lockfile hash with invalidate/re-fork, IPC for dispatch + streamed stdio + exit-code propagation, lifecycle (idle timeout, `daemon stop`, crash recovery), and — the real blocker — a **live, long-lived sandbox** that must be proven unable to outlive its isolation guarantees. That security surface alone outweighs a sub-second-per-run gain on a tool whose whole thesis is "spin up / throw away, no resident machine state".

The architectural levers that actually move the gate (RAM overlay, warm-fork, the shared CAS store, write-back) are shipped and stateless. A daemon trades that ephemerality for marginal latency — the wrong trade for this tool.

## Revisit when

A profile of the real dogfood loop shows the per-run mount + node-boot floor is a material fraction of wall-clock across the common commands (not just the trivial ones), AND a resident-sandbox security model is designed that demonstrably cannot outlive its isolation — both, before any IPC/lifecycle code.
