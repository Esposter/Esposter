# virrun — Roadmap

Open work only. Shipped features live in [README.md](README.md) `## Shipped`; the two non-negotiable gates (faster-than-native, differential-correct) live in README `## Gates`. Grep [out-of-scope/](out-of-scope) + [deferred/](deferred) before adding an item — decided ideas aren't re-argued.

## Now — speed & UX

Make the shipped Linux/WSL `os` path as fast and as useful as possible before broadening the isolation surface (the macOS bridge + Firecracker microVM backend are deferred → [deferred/additional-isolation-targets.md](deferred/additional-isolation-targets.md)).

- [ ] **Task cache (skip unchanged builds)** — evaluate reusing the Turborepo cache vs a native content-hash cache; the biggest remaining dev-loop speed lever now that warm-fork + write-back are shipped.
