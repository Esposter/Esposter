---
title: Materialize node_modules
description: Copy the sandbox install onto host disk — for an IDE, or as a faster drop-in for a native install.
---

# Materialize node_modules

Materialize the sandbox `node_modules` onto the host disk — for an IDE/native tooling, or to make `virrun -- pnpm install` a faster drop-in for a native install — beyond the produced-artifact write-back.

**Why not:** It can't beat a native install, by filesystem physics, on every platform. A native `pnpm install` imports from the warm store via **hardlinks** (same volume, no byte copies) and is already at the floor the OS allows. Materializing means installing in the sandbox and then **copying** node_modules out — cross-filesystem (sandbox → host, WSL → NTFS on win32), so hardlinks are impossible; it must write the actual bytes of tens of thousands of files, strictly more work than the native hardlink install, with the in-sandbox install on top. On win32 it also re-pays the full NTFS-metadata + Defender-scan cost that makes a cold native install slow in the first place. Materialize ≥ native install, always: virrun's install advantage exists _because_ node_modules stays in RAM and never touches disk.

This is also why there is no `install` benchmark group and no roadmap item to "route install through virrun": the os install feeds the fork snapshot, not host disk, so a head-to-head would imply a substitution that can't be made. Write-back enforces it structurally — the flush plan skips every snapshot-lower path, so node_modules is excluded by layer membership.

**Cheaper interim:** When on-disk deps are genuinely required — an IDE, or a native step like the CI coverage shards — run a plain native `pnpm install`. It's already at the hardlink floor, and the warm pnpm store cache makes it mostly linking.
