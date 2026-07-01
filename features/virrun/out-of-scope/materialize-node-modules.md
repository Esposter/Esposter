Materialize the sandbox `node_modules` onto the host disk — for an IDE/native tooling, or to make `virrun -- pnpm install` a faster drop-in for a native install — beyond the produced-artifact write-back.

## Why not

It can't beat a native install, by filesystem physics, on every platform:

- A native `pnpm install` imports from the warm store via **hardlinks** (same volume, no byte copies) and is already at the floor the OS allows.
- Materializing means installing in the sandbox (ext4/RAM) and then **copying** node_modules out to the host. That copy is **cross-filesystem** (sandbox → host, and WSL → NTFS on win32), so hardlinks are impossible — it must write the actual bytes of tens of thousands of files, strictly more work than the native hardlink install, with the in-sandbox install on top. On win32 it also re-pays the full NTFS-metadata + Defender-scan cost (the ~60-90s that makes a cold native install slow in the first place).

So materialize ≥ native install, always. virrun's install advantage exists _because_ node_modules stays in RAM and never touches disk; the moment it lands on disk the advantage is gone. There is no fast on-disk node_modules — that's an OS constraint, not something virrun can route around.

This is also why there is no `install` benchmark group and no roadmap item to "route install through virrun": the os install isn't a swap-in for a native one (it feeds the fork snapshot, not host disk), so a head-to-head would imply a substitution that can't be made. Write-back deliberately enforces this — `buildFlushPlan` skips every snapshot-lower (dep-tree) path, so node_modules is structurally excluded from the flush.

## Cheaper interim

When on-disk deps are genuinely required — an IDE/intellisense, or a native step like the CI coverage shards that run vitest outside the sandbox — run a plain native `pnpm install`. It's already at the hardlink floor, and the warm pnpm store cache (`cache: pnpm` in setup-project-dependencies) makes it mostly linking.
