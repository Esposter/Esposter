# virrun — Roadmap

Open work only. Shipped features live in [README.md](README.md) `## Shipped`; the two non-negotiable gates (faster-than-native, differential-correct) live in README `## Gates`. Grep [out-of-scope/](out-of-scope) + [deferred/](deferred) before adding an item — decided ideas aren't re-argued.

## Now — speed & UX

Make the shipped Linux/WSL `os` path as fast and as useful as possible before broadening the isolation surface (the macOS bridge + Firecracker microVM backend are deferred → [deferred/additional-isolation-targets.md](deferred/additional-isolation-targets.md)).

The task cache and the per-command overhead cut have shipped (README `## Shipped`, Phase 7). No open speed items remain on the `os` path; the next move is broadening the isolation surface (deferred), not squeezing the current one.

Profiling settled where the per-command tax actually lives (measured on ext4, i.e. CI-representative, not the local `/mnt/c` WSL bench that inflates it): bwrap + overlay setup is ~12–16 ms and the capability probe ~16 ms, both now negligible or cached away; the residue is inherent overlayfs read overhead (~30–50 % on the file I/O a command does), which can't be cut without abandoning the overlay model. So virrun stays marginally slower than native **per command** on a cold input — the win is the task cache **skipping** unchanged re-runs, and install-once fork; matching native per-command is not a goal (→ [out-of-scope/ci-walltime-gate.md](out-of-scope/ci-walltime-gate.md)).
