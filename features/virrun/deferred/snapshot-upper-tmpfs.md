Put the warm snapshot's overlay upper on tmpfs (RAM) instead of the disk-backed global cache, so warm forks read `node_modules` from RAM rather than through a disk-backed lower.

## Why deferred

Every warm fork reads `node_modules` through the disk-backed overlay lower (`getGlobalCacheDirectory()` → `~/.virrun-cache`), but the Linux page cache holds that tree in RAM after the first read — so repeated forks (the dev loop) already hit RAM, not disk. tmpfs would only help the first cold-cache read, and it costs persistent RAM plus the cross-reboot snapshot durability that putting the upper on disk buys.

## Revisit when

A profile shows cold-cache fork reads (page cache cold/evicted) are a material fraction of wall-clock in a real loop — only then does trading durability + RAM for the first-read saving pay off.
